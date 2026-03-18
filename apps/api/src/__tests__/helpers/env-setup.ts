import { mock } from "bun:test";

process.env.NODE_ENV = "test";
process.env.PORT = "0";
process.env.DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy";
process.env.REFRESH_TOKEN_SECRET = "dummy_refresh_secret";
process.env.ACCESS_TOKEN_SECRET = "dummy_access_secret";
process.env.GOOGLE_CLIENT_ID = "dummy_client_id";
process.env.GOOGLE_CLIENT_SECRET = "dummy_client_secret";
process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/callback";
process.env.APP_ORIGIN = "http://localhost:3000";

// Create a global Prisma Mock via Proxy to seamlessly mock all Models and Methods
const createPrismaMock = () => {
  return new Proxy(
    {},
    {
      get: (target: any, prop: string) => {
        // If it's a known non-model property, return undefined or handle it
        if (
          prop === "$connect" ||
          prop === "$disconnect" ||
          prop === "$transaction"
        ) {
          return mock(() => Promise.resolve());
        }

        if (!target[prop]) {
          target[prop] = new Proxy(
            {},
            {
              get: (modelTarget: any, modelProp: string) => {
                if (!modelTarget[modelProp]) {
                  modelTarget[modelProp] = mock();
                }
                return modelTarget[modelProp];
              },
            },
          );
        }
        return target[prop];
      },
    },
  );
};

mock.module("../../shared/lib/db", () => {
  return {
    default: createPrismaMock(),
  };
});

mock.module("argon2", () => {
  return {
    hash: mock(() =>
      Promise.resolve("$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy"),
    ),
    verify: mock((hash: string, plain: string) =>
      Promise.resolve(plain === "Password1!"),
    ),
  };
});
