import { observer } from "mobx-react";
import { Button } from "../../common/Button/Button";
import { IconRedo, IconRemove, IconUndo } from "@humansignal/icons";
import { Tooltip } from "@humansignal/ui";
import { Block, Elem } from "../../utils/bem";
import "./HistoryActions.scss";
import { Hotkey } from "../../core/Hotkey";

export const HistoryActions = observer(({ annotation }) => {
  const { history } = annotation;

  return (
    <Block name="history-buttons">
      <Hotkey.Tooltip name="annotation:undo">
        <Elem
          tag={Button}
          name="action"
          type="text"
          aria-label="Undo"
          disabled={!history?.canUndo}
          onClick={() => annotation.undo()}
          icon={<IconUndo />}
        />
      </Hotkey.Tooltip>
      <Hotkey.Tooltip name="annotation:redo">
        <Elem
          tag={Button}
          name="action"
          type="text"
          aria-label="Redo"
          disabled={!history?.canRedo}
          onClick={() => annotation.redo()}
          icon={<IconRedo />}
        />
      </Hotkey.Tooltip>
      <Tooltip title="Reset">
        <Elem
          tag={Button}
          name="action"
          look="danger"
          type="text"
          aria-label="Reset"
          disabled={!history?.canUndo}
          onClick={() => history?.reset()}
          icon={<IconRemove />}
        />
      </Tooltip>
    </Block>
  );
});
