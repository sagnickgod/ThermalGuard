export async function onRequest(context: any) {
  const { request, env } = context;
  const incidentUrl = new URL("/incident.html", request.url);
  return env.ASSETS.fetch(new Request(incidentUrl.toString(), request));
}
