import { useWizardConnection } from "~/composables/wizard/useWizardConnection";

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith("/wizard")) {
    useWizardConnection();
  }
});
