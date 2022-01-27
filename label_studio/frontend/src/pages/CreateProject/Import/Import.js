import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Modal } from '../../../components/Modal/Modal';
import { cn } from '../../../utils/bem';
import { unique } from '../../../utils/helpers';
import "./Import.styl";
import { IconError, IconInfo, IconUpload } from '../../../assets/icons';
import { useAPI } from '../../../providers/ApiProvider';

const importClass = cn("upload_page");
const dropzoneClass = cn("dropzone");

// 打平数组
function flatten(nested) {
  return [].concat(...nested);
}

// 遍历文件树
function traverseFileTree(item, path) {
  return new Promise((resolve) => {
    path = path || "";
    if (item.isFile) {
      // Avoid hidden files
      if (item.name[0] === ".") return resolve([]);

      resolve([item]);
    } else if (item.isDirectory) {
      // Get folder contents
      const dirReader = item.createReader();
      const dirPath = path + item.name + "/";

      dirReader.readEntries(function(entries) {
        Promise.all(entries.map(entry => traverseFileTree(entry, dirPath)))
          .then(flatten)
          .then(resolve);
      });
    }
  });
}

function getFiles(files) {
  // @todo this can be not a files, but text or any other draggable stuff
  return new Promise(resolve => {
    if (!files.length) return resolve([]);
    if (!files[0].webkitGetAsEntry) return resolve(files);

    // Use DataTransferItemList interface to access the file(s)
    const entries = Array.from(files).map(file => file.webkitGetAsEntry());

    Promise.all(entries.map(traverseFileTree))
      .then(flatten)
      .then(fileEntries => fileEntries.map(fileEntry => new Promise(res => fileEntry.file(res))))
      .then(filePromises => Promise.all(filePromises))
      .then(resolve);
  });
}

const Footer = () => {
  return (
    <Modal.Footer>
      <IconInfo className={importClass.elem("info-icon")} width="20" height="20" />
      See the&nbsp;documentation to <a target="_blank" href="https://labelstud.io/guide/predictions.html">import preannotated data</a>{" "}
      or&nbsp;to <a target="_blank" href="https://labelstud.io/guide/storage.html">sync data from a&nbsp;database or&nbsp;cloud storage</a>.
    </Modal.Footer>
  );
};

// 拖拽上传
const Upload = ({ children, sendFiles }) => {
  const [hovered, setHovered] = useState(false);
  const onHover = (e) => {
    e.preventDefault();
    setHovered(true);
  };
  const onLeave = setHovered.bind(null, false);
  const dropzoneRef = useRef();

  const onDrop = useCallback(e => {
    e.preventDefault();
    onLeave();
    getFiles(e.dataTransfer.items).then(files => sendFiles(files));
  }, [onLeave, sendFiles]);

  return (
    <div id="holder" className={dropzoneClass.mod({ hovered })} ref={dropzoneRef}
      onDragStart={onHover}
      onDragOver={onHover}
      onDragLeave={onLeave}
      onDrop={onDrop}
      // {...getRootProps}
    >
      {children}
    </div>
  );
};

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  let extra = error.validation_errors ?? error.extra;
  // support all possible responses

  if (extra && typeof extra === "object" && !Array.isArray(extra)) {
    extra = extra.non_field_errors ?? Object.values(extra);
  }
  if (Array.isArray(extra)) extra = extra.join("; ");

  return (
    <div className={importClass.elem("error")}>
      <IconError style={{ marginRight: 8 }} />
      {error.id && `[${error.id}] `}
      {error.detail || error.message}
      {extra && ` (${extra})`}
    </div>
  );
};

export const ImportPage = ({
  project,
  show = true,
  onWaiting,
  onFileListUpdate,
  highlightCsvHandling,
  dontCommitToProject = false,
  csvHandling,
  setCsvHandling,
  addColumns,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [ids, _setIds] = useState([]);
  const api = useAPI();

  // reducer，对不同 action 返回不同的 state
  const processFiles = (state, action) => {
    if (action.sending) {
      return { ...state, uploading: [...action.sending, ...state.uploading] };
    }
    if (action.sent) {
      return { ...state, uploading: state.uploading.filter(f => !action.sent.includes(f)) };
    }
    if (action.uploaded) {
      return { ...state, uploaded: unique([...state.uploaded, ...action.uploaded], (a, b) => a.id === b.id) };
    }
    // if (action.ids) {
    //   const ids = unique([...state.ids, ...action.ids]);
    //   onFileListUpdate?.(ids);
    //   return {...state, ids };
    // }
    return state;
  };
  const [files, dispatch] = useReducer(processFiles, { uploaded: [], uploading: [] });
  const showList = Boolean(files.uploaded?.length || files.uploading?.length);

  const setIds = (ids) => {
    _setIds(ids);
    onFileListUpdate?.(ids);
  };

  // 通过文件 id 数组，获取文件列表
  const loadFilesList = useCallback(async (file_upload_ids) => {
    const query = {};

    if (file_upload_ids) {
      // should be stringified array "[1,2]"
      query.ids = JSON.stringify(file_upload_ids);
    }
    const files = await api.callApi("fileUploads", {
      params: { pk: project.id, ...query },
    });

    dispatch({ uploaded: files ?? [] });
    if (files?.length) {
      setIds(unique([...ids, ...files.map(f => f.id)]));
    }
    return files;
  }, [project]);

  // 开始上传文件，设置一些状态
  const onStart = () => {
    setLoading(true);
    setError(null);
  };

  // 上传文件报错的回调
  const onError = err => {
    console.error(err);
    // @todo workaround for error about input size in a wrong html format
    if (typeof err === "string" && err.includes("RequestDataTooBig")) {
      const message = "导入的文件过大";
      const extra = err.match(/"exception_value">(.*)<\/pre>/)?.[1];

      err = { message, extra };
    }
    setError(err);
    setLoading(false);
    onWaiting?.(false);
  };

  // 上传文件成功的回调
  const onFinish = useCallback(res => {
    const { could_be_tasks_list, data_columns, file_upload_ids } = res;
    const file_ids = [...ids, ...file_upload_ids];

    setIds(file_ids);
    if (could_be_tasks_list && !csvHandling) setCsvHandling("choose");
    setLoading(true);
    onWaiting?.(false);
    addColumns(data_columns);
    return loadFilesList(file_ids).then(() => setLoading(false));
  }, [addColumns, loadFilesList, setIds, ids, setLoading]);

  // 发送请求，将文件保存到服务器，得到保存后的文件信息
  const importFiles = useCallback(async (files, body) => {
    dispatch({ sending: files });

    const query = dontCommitToProject ? { commit_to_project: "false" } : {};
    // @todo use json for dataset uploads by URL
    const contentType = body instanceof FormData
      ? 'multipart/form-data' // usual multipart for usual files
      : 'application/x-www-form-urlencoded'; // chad urlencoded for URL uploads
    const res = await api.callApi("importFiles", {
      params: { pk: project.id, ...query },
      headers: { 'Content-Type': contentType },
      body,
      errorFilter: () => true,
    });

    if (res && !res.error) onFinish?.(res);
    else onError?.(res?.response);

    dispatch({ sent: files });
  }, [project, onFinish]);

  // 将文件填充到 FormData，然后调用 importFiles，进行文件上传
  const sendFiles = useCallback(files => {
    onStart();
    onWaiting?.(true);
    files = [...files]; // they can be array-like object
    const fd = new FormData;

    for (let f of files) fd.append(f.name, f);
    return importFiles(files, fd);
  }, [importFiles, onStart]);

  // 输入框的文件改变了，需要上传了
  const onUpload = useCallback(e => {
    sendFiles(e.target.files);
    e.target.value = "";
  }, [sendFiles]);

  // 数据集 URL 被提交时触发
  const onLoadURL = useCallback(e => {
    e.preventDefault();
    onStart();
    const url = urlRef.current?.value;

    if (!url) {
      setLoading(false);
      return;
    }
    urlRef.current.value = "";
    onWaiting?.(true);
    const body = new URLSearchParams({ url });

    importFiles([{ name: url }], body);
  }, [importFiles]);

  // 项目、文件列表有变化时，执行一些副作用
  useEffect(() => {
    if (project?.id !== undefined) {
      loadFilesList().then(files => {
        if (csvHandling) return;
        // empirical guess on start if we have some possible tasks list/time series problem
        if (Array.isArray(files) && files.some(({ file }) => /\.[ct]sv$/.test(file))) {
          setCsvHandling("choose");
        }
      });
    }
  }, [project, loadFilesList]);

  const urlRef = useRef();

  if (!project) return null;
  if (!show) return null;

  const csvProps = {
    name: "csv",
    type: "radio",
    onChange: e => setCsvHandling(e.target.value),
  };

  return (
    <div className={importClass}>
      {highlightCsvHandling && <div className={importClass.elem("csv-splash")}/>}
      <input id="file-input" type="file" name="file" multiple onChange={onUpload} style={{ display: "none" }}/>

      <header>
        <form className={importClass.elem("url-form") + " inline"} method="POST" onSubmit={onLoadURL}>
          <input placeholder="数据集 URL" name="url" ref={urlRef} />
          <button type="submit">添加 URL</button>
        </form>
        <span>或者</span>
        <button onClick={() => document.getElementById('file-input').click()} className={importClass.elem("upload-button")}>
          <IconUpload width="16" height="16" className={importClass.elem("upload-icon")} />
          点击上传{files.uploaded.length ? "更多" : ""}文件
        </button>
        {/* 如果上传的是 csv tsv 文件，展示一个选择框，选择应该如何看待该文件 */}
        <div className={importClass.elem("csv-handling").mod({ highlighted: highlightCsvHandling, hidden: !csvHandling })}>
          <span>选择 CSV/TSV 的类型</span>
          <label><input {...csvProps} value="tasks" checked={csvHandling === "tasks"}/> 任务列表</label>
          <label><input {...csvProps} value="ts" checked={csvHandling === "ts"}/> 时间序列</label>
        </div>
        <div className={importClass.elem("status")}>
          {files.uploaded.length
            ? `${files.uploaded.length} 个文件已上传`
            : ""}
        </div>
      </header>

      <ErrorMessage error={error} />

      <main>
        <Upload sendFiles={sendFiles} project={project}>
          {!showList && (
            <label htmlFor="file-input">
              <div className={dropzoneClass.elem("content")}>
                <header>拖拽文件到这里<br/>或者点击这里浏览文件</header>
                <IconUpload height="64" className={dropzoneClass.elem("icon")} />
                <dl>
                  <dt>文本</dt><dd>txt</dd>
                  <dt>音频</dt><dd>wav, aiff, mp3, au, flac, m4a, ogg</dd>
                  <dt>图片</dt><dd>jpg, png, gif, bmp, svg, webp</dd>
                  <dt>HTML</dt><dd>html, htm, xml</dd>
                  <dt>时间序列</dt><dd>csv, tsv</dd>
                  <dt>通用格式</dt><dd>csv, tsv, txt, json</dd>
                </dl>
              </div>
            </label>
          )}

          {showList && (
            <table>
              <tbody>
                {files.uploading.map(file => (
                  <tr key={file.name}>
                    <td>{file.name}</td>
                    <td><span className={importClass.elem("file-status").mod({ uploading: true })} /></td>
                  </tr>
                ))}
                {files.uploaded.map(file => (
                  <tr key={file.file}>
                    <td>{file.file}</td>
                    <td><span className={importClass.elem("file-status")} /></td>
                    <td>{file.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Upload>
      </main>

      <Footer />
    </div>
  );
};
