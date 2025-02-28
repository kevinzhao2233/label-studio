export const isFlagEnabled = (id: string, flagList: Record<string, boolean>, defaultValue = false) => {
  if (id in flagList) {
    return flagList[id] === true;
  }
  return defaultValue;
};

export const formDataToJPO = (formData: FormData) => {
  if (formData instanceof FormData) {
    return Object.fromEntries(formData.entries());
  }

  return formData;
};

export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== null && value !== undefined;
};

export const userDisplayName = (user: any) => {
  const firstName = user?.first_name;
  const lastName = user?.last_name;

  return firstName || lastName
    ? [firstName, lastName]
        .filter((n) => !!n)
        .join(" ")
        .trim()
    : user?.username ?? user?.email ?? "";
};
