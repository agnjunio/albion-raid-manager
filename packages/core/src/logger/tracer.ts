import tracer from "dd-trace";

import config from "@albion-raid-manager/core/config";

tracer.init({
  service: config.service.name,
  tags: {
    application: config.service.application,
    version: config.service.version,
  },
});

export default tracer;
