// src/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders text", () => {
    render(<Button label="Hello" />);
    const button = screen.getByText("Hello");
    expect(button).toBeInTheDocument();
  });

  it("handles click", () => {
    const handleClick = jest.fn(); // <-- use jest.fn() instead of vi.fn()
    render(<Button label="Click me" onClick={handleClick} />);

    const button = screen.getByText("Click me");
    fireEvent.click(button);

    console.log("handleClick call count:", handleClick.mock.calls.length);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// // src\Button.test.tsx
// import { render, screen, fireEvent } from "@testing-library/react";
// // import { describe, it, expect, vi } from "vitest";
// import Button from "./Button";

// describe("Button", () => {
//   it("renders text", () => {
//     render(<Button label="Hello" />);
//     const button = screen.getByText("Hello");
//     // console.log("Button element:", button); // <-- logs DOM element
//     // expect(screen.getByText("Hello")).toBeInTheDocument();
//     expect(button).toBeInTheDocument();
//   });

//   it("handles click", () => {
//     const handleClick = vi.fn();
//     render(<Button label="Click me" onClick={handleClick} />);

//     const button = screen.getByText("Click me");
//     fireEvent.click(button);
//     // fireEvent.click(screen.getByText("Click me"));

//     console.log("handleClick call count:", handleClick.mock.calls.length);
//     // console.log("handleClick mock calls:", handleClick.mock.calls);

//     expect(handleClick).toHaveBeenCalledTimes(1);
//   });
// });
