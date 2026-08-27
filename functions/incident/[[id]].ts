export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Fetch the static /incident/demo/index.html page asset and return with status 200
  const demoUrl = new URL("/incident/demo/index.html", request.url);
  return env.ASSETS.fetch(new Request(demoUrl.toString(), request));
}
