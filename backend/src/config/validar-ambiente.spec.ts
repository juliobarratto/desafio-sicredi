import { validarAmbiente } from "./validar-ambiente";

describe("validarAmbiente", () => {
  it("normaliza a configuração e aplica valores padrão", () => {
    expect(
      validarAmbiente({
        DATABASE_URL: " postgresql://usuario:senha@localhost:5432/banco ",
      }),
    ).toEqual(
      expect.objectContaining({
        DATABASE_URL: "postgresql://usuario:senha@localhost:5432/banco",
        CORS_ORIGINS: "http://localhost:3001",
        PORT: 3000,
      }),
    );
  });

  it("falha cedo quando a configuração é inválida", () => {
    expect(() => validarAmbiente({})).toThrow("DATABASE_URL");
    expect(() =>
      validarAmbiente({ DATABASE_URL: "mysql://localhost/banco" }),
    ).toThrow("postgresql: ou postgres:");
    expect(() =>
      validarAmbiente({
        DATABASE_URL: "postgresql://localhost/banco",
        PORT: "70000",
      }),
    ).toThrow("PORT");
  });
});
