const OBJECTS = {
  Image: {
    type: 'Image',
    settings: {
      strokeWidth: {
        title: '框选区域的宽度',
        type: Number,
        param: ($obj, value) => $obj.$controls.forEach($control => $control.setAttribute('strokeWidth', value)),
        value: $obj => $obj.$controls[0]?.getAttribute('strokeWidth') ?? 1,
      },
      zoom: {
        title: '允许图片缩放 (ctrl+鼠标滚轮)',
        type: Boolean,
        param: 'zoom',
      },
      zoomControl: {
        title: '展示放大缩小控件',
        type: Boolean,
        param: 'zoomControl',
      },
      rotateControl: {
        title: '展示图片旋转控件',
        type: Boolean,
        param: 'rotateControl',
      },
      crosshair: {
        title: '展示十字线',
        type: Boolean,
        param: 'crosshair',
      },
    },
  },
  Text: {
    type: 'Text',
    settings: {
      granularity: {
        title: '按照词选择文本',
        type: Boolean,
        param: ($obj, value) => value ? $obj.setAttribute('granularity', 'word') : $obj.removeAttribute('granularity'),
        value: $obj => $obj.getAttribute('granularity') === 'word',
        when: $obj => $obj.$controls.filter(c => c.tagName.endsWith('Labels')).length > 0,
      },
    },
  },
  HyperText: {
    type: 'HyperText',
  },
  Audio: {
    type: 'Audio',
  },
  AudioPlus: {
    type: 'AudioPlus',
  },
  TimeSeries: {
    type: 'TimeSeries',
  },
  Paragraphs: {
    type: 'Paragraphs',
  },
  Table: {
    type: 'Table',
  },
};

const Labels = {
  type: 'Labels',
  settings: {
    placeLabelsLeft: {
      title: '标签位置:',
      type: ["bottom", "left", "right", "top"],
      control: true,
      param: ($control, value) => {
        let $container = $control.parentNode;
        let $labels = $control;

        if ($container.firstChild?.tagName?.toUpperCase() === "FILTER") {
          $labels = $container;
          $container = $labels.parentNode;
        }
        const $obj = $control.$object;
        const inline = ["top", "bottom"].includes(value);
        const reversed = ["top", "left"].includes(value);
        const direction = (inline ? "column" : "row") + (reversed ? "-reverse" : "");
        const alreadyApplied = $container.getAttribute("style")?.includes("flex");

        if (!alreadyApplied) {
          $container = $obj.ownerDocument.createElement('View');
          $labels.parentNode.insertBefore($container, $obj);
          $container.appendChild($obj);
          $container.appendChild($labels);
        }
        $control.setAttribute('showInline', JSON.stringify(inline));
        $container.setAttribute('style', 'display:flex;align-items:start;gap:8px;flex-direction:' + direction);
      },
      value: $control => {
        let $container = $control.parentNode;

        if ($container.firstChild?.tagName?.toUpperCase() === "FILTER") {
          $container = $container.parentNode;
        }
        const style = $container.getAttribute("style");
        const direction = style?.match(/direction:(row|column)(-reverse)?/);

        if (!direction) {
          const position = $control.compareDocumentPosition($control.$object);

          return position & Node.DOCUMENT_POSITION_FOLLOWING ? "top" : "bottom";
        }
        if (direction[1] === "column") return direction[2] ? "top" : "bottom";
        else return direction[2] ? "left" : "right";
      },
    },
    filter: {
      title: '在标签列表上添加过滤器',
      type: Boolean,
      control: true,
      param: ($obj, value) => {
        if (value) {
          const $filter = $obj.ownerDocument.createElement('Filter');
          const $container = $obj.ownerDocument.createElement('View');

          $filter.setAttribute('toName', $obj.getAttribute('name'));
          $filter.setAttribute('minlength', 0);
          $filter.setAttribute('name', 'filter'); // @todo should be unique
          $obj.parentNode.insertBefore($container, $obj);
          $container.appendChild($filter);
          $container.appendChild($obj);
        } else {
          const $filter = $obj.previousElementSibling;

          if ($filter.tagName.toUpperCase() === "FILTER") {
            const $container = $obj.parentNode;

            $container.parentNode.insertBefore($obj, $container);
            $container.parentNode.removeChild($container);
          }
        }
      },
      value: $control => $control.previousElementSibling?.tagName.toUpperCase() === "FILTER",
    },
  },
};

const CONTROLS = {
  Labels,
  RectangleLabels: Labels,
};

const TAGS = { ...OBJECTS, ...CONTROLS };

export { OBJECTS, CONTROLS, TAGS };
