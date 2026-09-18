import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

afterEach(cleanup);

const cases = [
  ["saved", "Saved"],
  ["applied", "Applied"],
  ["interviewing", "Interviewing"],
  ["offer", "Offer"],
  ["rejected", "Rejected"],
] as const;

describe("StatusBadge", () => {
  it.each(cases)("renders the %s status as %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label).className).toContain(`status-${status}`);
  });

  it("passes through extra class names", () => {
    render(<StatusBadge status="offer" className="ml-2" />);
    expect(screen.getByText("Offer").className).toContain("ml-2");
  });
});
