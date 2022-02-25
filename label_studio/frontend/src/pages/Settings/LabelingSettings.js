import { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { confirm } from '../../components/Modal/Modal';
import { useAPI } from '../../providers/ApiProvider';
import { useProject } from '../../providers/ProjectProvider';
import { isEmptyString } from '../../utils/helpers';
import { ConfigPage } from '../CreateProject/Config/Config';

export const LabelingSettings = () => {
  const history = useHistory();
  const { project, fetchProject } = useProject();
  const [config, setConfig] = useState("");
  const [essentialDataChanged, setEssentialDataChanged] = useState(false);
  const api = useAPI();

  const saveConfig = useCallback(async () => {
    const res = await api.callApi("updateProjectRaw", {
      params: {
        pk: project.id,
      },
      body: {
        label_config: config,
      },
    });

    if (res.ok) {
      history.push(`/projects/${project.id}/data`);
      return true;
    }

    const error = await res.json();

    fetchProject();
    return error;
  }, [project, config]);

  const projectAlreadySetUp = useMemo(() => {
    if (project.label_config) {
      const hasConfig = !isEmptyString(project.label_config);
      const configIsEmpty = project.label_config.replace(/\s/g, '') === '<View></View>';
      const hasTasks = project.task_number > 0;

      // console.log({ hasConfig, configIsEmpty, hasTasks, project });
      return (hasConfig && !configIsEmpty) && hasTasks;
    }
    return false;
  }, [project]);

  const onSave = useCallback(async () => {
    if (essentialDataChanged && projectAlreadySetUp) {
      confirm({
        title: "配置已更改",
        body: "当前更改的配置会对数据展示产生影响，保存配置可能删除之前在数据管理器中创建的所有标签。",
        buttonLook: "destructive",
        onOk: () => saveConfig(),
        okText: "保存",
        cancelText: "取消",
      });
    } else {
      saveConfig();
    }
  }, [essentialDataChanged, saveConfig]);

  const onUpdate = useCallback((config) => {
    setConfig(config);
    fetchProject();
  });

  const onValidate = useCallback((validation) => {
    setEssentialDataChanged(validation.config_essential_data_has_changed);
  }, []);

  if (!project.id) return null;

  return (
    <ConfigPage
      config={project.label_config}
      project={project}
      onUpdate={onUpdate}
      onSaveClick={onSave}
      onValidate={onValidate}
    />
  );
};

LabelingSettings.title = "标注界面";
LabelingSettings.path = "/labeling";
