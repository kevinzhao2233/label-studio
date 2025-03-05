import type { FC } from "react";
import { Block, Elem } from "../../../utils/bem";

import "./Info.scss";
import { IconInfoConfig } from "@humansignal/ui";

export interface InfoProps {
  text: string;
}

export const Info: FC<InfoProps> = ({ text }) => {
  return (
    <Block name="control-info">
      <IconInfoConfig />
      <Elem name={"tooltip"}>{text}</Elem>
    </Block>
  );
};
