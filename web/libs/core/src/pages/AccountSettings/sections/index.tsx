import { PersonalInfo } from "./PersonalInfo";
import { EmailPreferences } from "./EmailPreferences";
import { PersonalAccessToken, PersonalAccessTokenDescription } from "./PersonalAccessToken";
import { MembershipInfo } from "./MembershipInfo";
import type React from "react";
import { PersonalJWTToken } from "./PersonalJWTToken";
import "./index.raw.css";
import type { AuthTokenSettings } from "../types";

type SectionType = {
  title: string;
  id: string;
  component: React.FC;
  description?: React.FC;
};

export const accountSettingsSections = (settings: AuthTokenSettings): SectionType[] => {
  return [
    {
      title: "Personal Info",
      id: "personal-info",
      component: PersonalInfo,
    },
    {
      title: "Email Preferences",
      id: "email-preferences",
      component: EmailPreferences,
    },
    {
      title: "Membership Info",
      id: "membership-info",
      component: MembershipInfo,
    },
    settings.api_tokens_enabled && {
      title: "Personal Access Token",
      id: "personal-access-token",
      // component: PersonalAccessToken,
      component: PersonalJWTToken,
      description: PersonalAccessTokenDescription,
    },
    settings.legacy_api_tokens_enabled && {
      title: "Legacy Token",
      id: "personal-access-token",
      // component: PersonalAccessToken,
      component: PersonalAccessToken,
      description: PersonalAccessTokenDescription,
    },
  ].filter(Boolean) as SectionType[];
};
