const config = {
    env: "production",
    serviceName: process.env.SERVER_NAME || "BPP",
    APP_SECRET: process.env.APP_SECRET || "8tTu2671idjIoIYE9i909",
    port: process.env["PORT"] || 3000,
    db: {
        url: process.env["MONGODB_URI"],
    },
    pubsubDriver: process.env["PUB_SUB_DRIVER"] || "redis", //{SNS}
};

module.exports = Object.assign({},config, require("./base"));