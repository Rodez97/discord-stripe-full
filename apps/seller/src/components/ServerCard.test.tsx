import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ServerCard from "./ServerCard";

// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
    };
  },
}));

test("renders server name", () => {
  render(
    <ServerCard
      guild={{
        name: "Test Server",
        icon: "",
        id: "1",
        ownerId: "123",
        botIsInServer: false,
      }}
      mutate={{} as any}
    />
  );
  const serverName = screen.getByText(/Test Server/i);
  expect(serverName).toBeInTheDocument();
});
