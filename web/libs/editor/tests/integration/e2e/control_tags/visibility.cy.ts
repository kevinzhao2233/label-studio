import { useChoices, LabelStudio, Textarea, ImageView, Sidebar, Choices } from "@humansignal/frontend-test/helpers/LSF";
import {
  multipleChainedViewsVisibilityConfig,
  perRegionConditionalVisibilityConfig,
  perRegionConditionalVisibilityResult,
  perRegionVisibilityConfig,
  perRegionVisibilityResult,
  simpleUnselectedVisibilityConfig,
  simpleVisibleWhenVisibilityConfig,
  textareaVisibilityConfig,
  visibilityImageData,
  visibilityTextData,
} from "../../data/control_tags/visibility";

const checkVisibility = (visibleIndexes: number[], totalIndexes: number) => {
  Array.from({ length: totalIndexes }).forEach((_, i) => {
    cy.get(`.lsf-choices:eq(${i})`).should(visibleIndexes.includes(i) ? "be.visible" : "not.be.visible");
  });
};

describe("Visibility", () => {
  it("Ensure correct visibility of conditionally selected choices", () => {
    LabelStudio.params().config(simpleVisibleWhenVisibilityConfig).data(visibilityTextData).withResult([]).init();

    const l1Choice = useChoices("&:eq(0)");
    const l2Choice = useChoices("&:eq(1)");
    const l3Choice = useChoices("&:eq(2)");
    checkVisibility([0], 3);

    l1Choice.findChoice("1A").click();
    checkVisibility([0, 1], 3);

    l2Choice.findChoice("2A").click();
    l3Choice.findChoice("3A").click();
    checkVisibility([0, 1, 2], 3);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(3);
      expect(result[0]).to.include({ from_name: "level1" });
      expect(result[0].value.choices).to.have.lengthOf(1);
      expect(result[0]).to.nested.include({ "value.choices[0]": "1A" });
      expect(result[1]).to.include({ from_name: "level2" });
      expect(result[1].value.choices).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({ "value.choices[0]": "2A" });
      expect(result[2]).to.include({ from_name: "level3" });
      expect(result[2].value.choices).to.have.lengthOf(1);
      expect(result[2]).to.nested.include({ "value.choices[0]": "3A" });
    });

    l1Choice.findChoice("1A").click();
    checkVisibility([0], 3);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(0);
    });

    l1Choice.findChoice("1B").click();
    checkVisibility([0], 3);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(1);
      expect(result[0].from_name).to.equal("level1");
      expect(result[0].value.choices).to.have.lengthOf(1);
      expect(result[0].value.choices[0]).to.equal("1B");
    });
  });

  it("Ensure correct visibility of conditionally selected choices with parent visibility restrictions", () => {
    LabelStudio.params().config(multipleChainedViewsVisibilityConfig).data(visibilityTextData).withResult([]).init();

    const l1Choice = useChoices("&:eq(0)");
    const l2Choice = useChoices("&:eq(1)");
    const l3AChoice = useChoices("&:eq(2)");
    checkVisibility([0], 4);

    l1Choice.findChoice("1A").click();
    checkVisibility([0, 1], 4);

    l2Choice.findChoice("2A").click();
    checkVisibility([0, 1, 2], 4);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.include({ from_name: "level1" });
      expect(result[0].value.choices).to.have.lengthOf(1);
      expect(result[0]).to.nested.include({ "value.choices[0]": "1A" });
      expect(result[1]).to.include({ from_name: "level2" });
      expect(result[1].value.choices).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({ "value.choices[0]": "2A" });
    });

    l3AChoice.findChoice("3X").click();
    checkVisibility([0, 1, 2], 4);

    l1Choice.findChoice("1A").click();
    checkVisibility([0], 4);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(0);
    });
  });

  it("Ensure correct visibility of conditionally selected and submitted textarea", () => {
    LabelStudio.params().config(textareaVisibilityConfig).data(visibilityTextData).withResult([]).init();

    const l1Choice = useChoices("&:eq(0)");
    checkVisibility([0], 1);

    l1Choice.findChoice("choice1").click();

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.include({ from_name: "author" });
      expect(result[0].value.choices).to.have.lengthOf(1);
      expect(result[0]).to.nested.include({ "value.choices[0]": "choice1" });
    });

    Textarea.type("text1{enter}");

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.include({ from_name: "author" });
      expect(result[0].value.choices).to.have.lengthOf(1);
      expect(result[0]).to.nested.include({ "value.choices[0]": "choice1" });
      expect(result[1]).to.include({ from_name: "new_author" });
      expect(result[1].value.text).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({ "value.text[0]": "text1" });
    });

    l1Choice.findChoice("choice1").click();
    checkVisibility([0], 1);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(0);
    });
  });

  it("Ensure correct visibility and data submission of simple perRegion controls", () => {
    LabelStudio.params()
      .config(perRegionVisibilityConfig)
      .data(visibilityImageData)
      .withResult(perRegionVisibilityResult)
      .init();

    ImageView.waitForImage();

    Sidebar.hasRegions(1);
    Sidebar.toggleRegionSelection(0);
    Sidebar.hasSelectedRegions(1);

    Choices.findChoice("Benign").click();

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.include({ from_name: "label" });
      expect(result[0].value.rectanglelabels).to.have.lengthOf(1);
      expect(result[0]).to.nested.include({ "value.rectanglelabels[0]": "Tumor" });
      expect(result[1]).to.include({ from_name: "classification" });
      expect(result[1].value.choices).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({ "value.choices[0]": "Benign" });
    });

    ImageView.clickAtRelative(0.5, 0.5);
    Sidebar.hasSelectedRegions(0);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.include({ from_name: "label" });
      expect(result[0].value.rectanglelabels).to.have.lengthOf(1);
      expect(result[0]).to.nested.include({ "value.rectanglelabels[0]": "Tumor" });
      expect(result[1]).to.include({ from_name: "classification" });
      expect(result[1].value.choices).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({ "value.choices[0]": "Benign" });
    });
  });

  it("Ensure correct visibility and data submission of conditionally visible perRegion controls", () => {
    LabelStudio.params()
      .config(perRegionConditionalVisibilityConfig)
      .data(visibilityImageData)
      .withResult(perRegionConditionalVisibilityResult)
      .init();

    ImageView.waitForImage();

    Sidebar.hasRegions(1);
    Sidebar.toggleRegionSelection(0);
    Sidebar.hasSelectedRegions(1);

    const l1Choice = useChoices("&:eq(0)");
    const l2Choice = useChoices("&:eq(1)");
    const l3AChoice = useChoices("&:eq(2)");
    checkVisibility([0], 4);

    l1Choice.findChoice("Start nesting choices").click();
    checkVisibility([0, 1], 3);

    l2Choice.findChoice("A").click();
    l3AChoice.findChoice("X").click();
    checkVisibility([0, 1, 2], 3);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(4);
      expect(result[0]).to.include({ from_name: "rect" });
      expect(result[0]).to.nested.include({ "value.x": 22.72106824925816 });
      expect(result[1]).to.include({ from_name: "level1" });
      expect(result[1].value.choices).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({ "value.choices[0]": "Start nesting choices" });
      expect(result[2]).to.include({ from_name: "level2_safety" });
      expect(result[2].value.choices).to.have.lengthOf(1);
      expect(result[2]).to.nested.include({ "value.choices[0]": "A" });
      expect(result[3]).to.include({ from_name: "level3_doc" });
      expect(result[3].value.choices).to.have.lengthOf(1);
      expect(result[3]).to.nested.include({ "value.choices[0]": "X" });
    });

    l1Choice.findChoice("Start nesting choices").click();
    checkVisibility([0], 3);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.include({ from_name: "rect" });
      expect(result[0]).to.nested.include({ "value.x": 22.72106824925816 });
    });

    // l1Choice.findChoice("Start nesting choices").click();
    ImageView.clickAtRelative(0.5, 0.5);
    Sidebar.hasSelectedRegions(0);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(4);
      expect(result[0]).to.include({ from_name: "rect" });
      expect(result[0]).to.nested.include({ "value.x": 22.72106824925816 });
      expect(result[1]).to.include({ from_name: "level1" });
      expect(result[1].value.choices).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({ "value.choices[0]": "Start nesting choices" });
      expect(result[2]).to.include({ from_name: "level2_safety" });
      expect(result[2].value.choices).to.have.lengthOf(1);
      expect(result[2]).to.nested.include({ "value.choices[0]": "A" });
      expect(result[3]).to.include({ from_name: "level3_doc" });
      expect(result[3].value.choices).to.have.lengthOf(1);
      expect(result[3]).to.nested.include({ "value.choices[0]": "X" });
    });
  });

  it("Ensure correct visibility and data submission of conditionally unselected choices", () => {
    LabelStudio.params().config(simpleUnselectedVisibilityConfig).data(visibilityTextData).withResult([]).init();

    const l1Choice = useChoices("&:eq(0)");
    const l2Choice = useChoices("&:eq(1)");
    const l3Choice = useChoices("&:eq(2)");
    checkVisibility([0, 2], 3);

    l1Choice.findChoice("A").click();
    checkVisibility([0, 1, 2], 3);

    l2Choice.findChoice("1X").click();
    l3Choice.findChoice("2X").click();

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(3);
      expect(result[0]).to.include({ from_name: "level1" });
      expect(result[0].value.choices).to.have.lengthOf(1);
      expect(result[0]).to.nested.include({ "value.choices[0]": "A" });
      expect(result[1]).to.include({ from_name: "selected-level" });
      expect(result[1].value.choices).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({ "value.choices[0]": "1X" });
      expect(result[2]).to.include({ from_name: "unselected-level" });
      expect(result[2].value.choices).to.have.lengthOf(1);
      expect(result[2]).to.nested.include({ "value.choices[0]": "2X" });
    });
  });
});
