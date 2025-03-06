import { render } from "@testing-library/react";
import { AnnotationsCarousel } from "../AnnotationsCarousel";
// eslint-disable-next-line
// @ts-ignore
import { annotationStore, store } from "./sampleData.js";
import { Provider } from "mobx-react";

jest.mock("@humansignal/ui", () => {
  const { forwardRef } = jest.requireActual("react");
  const actualCheckbox = jest.requireActual("@humansignal/ui/lib/checkbox/checkbox");
  const actualToast = jest.requireActual("@humansignal/ui/lib/Toast/Toast");
  const { LsChevron } = jest.requireActual("@humansignal/ui");

  return {
    __esModule: true,
    ...actualCheckbox,
    ...actualToast,
    LsChevron,
    Label: forwardRef(({ children }, ref) => {
      return (
        <div data-testid="label" ref={ref}>
          {children}
        </div>
      );
    }),
    Tooltip: forwardRef(({ children }, ref) => {
      return (
        <div data-testid="tooltip" ref={ref}>
          {children}
        </div>
      );
    }),
    Userpic: forwardRef(({ children }, ref) => {
      return (
        <div data-testid="userpic" ref={ref}>
          {children}
        </div>
      );
    }),
  };
});

const mockStore = {
  hasInterface: jest.fn().mockReturnValue(true),
};

test("AnnotationsCarousel", async () => {
  const { container } = render(
    <Provider store={mockStore}>
      <AnnotationsCarousel annotationStore={annotationStore} store={store} />
    </Provider>,
  );

  expect(container.querySelectorAll(".dm-annotations-carousel__carosel  > *").length).toBe(9);
});
