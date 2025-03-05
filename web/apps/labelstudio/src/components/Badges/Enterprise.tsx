import type { FC } from "react";
import { IconSparkGradient } from "@humansignal/ui";
import { Block, Elem } from "../../utils/bem";
import "./Enterprise.scss";

export const EnterpriseBadge: FC<{
  filled?: boolean;
}> = ({ filled }) => {
  return (
    <Block name="enterprise-badge" mod={{ filled }}>
      <Elem name="label">
        <Elem name="icon" tag={IconSparkGradient} />
        Enterprise
      </Elem>
    </Block>
  );
};
