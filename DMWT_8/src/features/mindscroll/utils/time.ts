export const formatPhoneTime = () => new Intl.DateTimeFormat("de-DE", {
  hour: "numeric",
  minute: "2-digit",
}).format(new Date());
