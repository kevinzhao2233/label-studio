import { ProjectsPage } from "./Projects/Projects";
import { HomePage } from "./Home/HomePage";
import { OrganizationPage } from "./Organization";
import { ModelsPage } from "./Organization/Models/ModelsPage";
import { FF_HOMEPAGE } from "../utils/feature-flags";
import { pages } from "@humansignal/core";
import { FF_AUTH_TOKENS, isFF } from "../utils/feature-flags";

export const Pages = [
  isFF(FF_HOMEPAGE) && HomePage,
  ProjectsPage,
  OrganizationPage,
  ModelsPage,
  isFF(FF_AUTH_TOKENS) && pages.AccountSettingsPage,
].filter(Boolean);
