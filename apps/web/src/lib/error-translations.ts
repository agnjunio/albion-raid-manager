import { APIErrorType } from "@albion-raid-manager/types/api";

import i18n from "./i18n";

export function translateError(errorType: APIErrorType): string {
  const t = i18n.t;

  switch (errorType) {
    case APIErrorType.AUTHENTICATION_FAILED:
      return t("errors.authenticationFailed");
    case APIErrorType.BAD_REQUEST:
      return t("errors.badRequest");
    case APIErrorType.BOT_NOT_INSTALLED:
      return t("errors.botNotInstalled");
    case APIErrorType.INTERNAL_SERVER_ERROR:
      return t("errors.internalServerError");
    case APIErrorType.NOT_AUTHORIZED:
      return t("errors.notAuthorized");
    case APIErrorType.NOT_FOUND:
      return t("errors.notFound");
    case APIErrorType.SERVER_ALREADY_EXISTS:
      return t("errors.serverAlreadyExists");
    case APIErrorType.SERVER_VERIFICATION_FAILED:
      return t("errors.serverVerificationFailed");
    case APIErrorType.SESSION_EXPIRED:
      return t("errors.sessionExpired");
    case APIErrorType.UNKNOWN:
    default:
      return t("errors.unknown");
  }
}
