import clsx from "clsx";
import type { FC } from "react";
import { IconSpark } from "../../assets/icons";
import styles from "./enterprise-badge.module.scss";

/* eslint-disable-next-line */
export interface EnterpriseBadgeProps {
  filled?: boolean;
}

export const EnterpriseBadge: FC<{
  filled?: boolean;
}> = ({ filled }) => {
  return (
    <div className={clsx(styles.badge, { [styles.filled]: filled })}>
      <div className={clsx(styles.label)}>
        <IconSpark className={clsx(styles.icon)} />
        Enterprise
      </div>
    </div>
  );
};

export default EnterpriseBadge;
