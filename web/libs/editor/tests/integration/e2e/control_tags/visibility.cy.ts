import { useChoices, LabelStudio } from "@humansignal/frontend-test/helpers/LSF";
import { multipleChainedViewsConfig, simpleVisibleWhenConfig, visibilityTextData } from "../../data/control_tags/visibility";

const checkVisibility = (visibleIndexes: number[], totalIndexes: number) => {
  Array.from({ length: totalIndexes }).forEach((_, i) => {
    cy.get(`.lsf-choices:eq(${i})`).should(visibleIndexes.includes(i) ? "be.visible" : "not.be.visible");
  });
};

describe("Visibility", () => {
  it("Ensure correct visibility of conditionally selected choices", () => {
    LabelStudio.params()
      .config(simpleVisibleWhenConfig)
      .data(visibilityTextData)
      .withResult([])
      .init();

    const l1Choice = useChoices('&:eq(0)');
    const l2Choice = useChoices('&:eq(1)');
    const l3Choice = useChoices('&:eq(2)');
    checkVisibility([0], 3);

    l1Choice.findChoice("1A").click();
    checkVisibility([0, 1], 3);

    l2Choice.findChoice("2A").click();
    checkVisibility([0, 1, 2], 3);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.include({from_name: "level1"});
      expect(result[0].value.choices).to.have.lengthOf(1);
      expect(result[0]).to.nested.include({"value.choices[0]": "1A"});
      expect(result[1]).to.include({from_name: "level2"});
      expect(result[1].value.choices).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({"value.choices[0]": "2A"});
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
    LabelStudio.params()
      .config(multipleChainedViewsConfig)
      .data(visibilityTextData)
      .withResult([])
      .init();

    const l1Choice = useChoices('&:eq(0)');
    const l2Choice = useChoices('&:eq(1)');
    const l3AChoice = useChoices('&:eq(2)');
    checkVisibility([0], 4);

    l1Choice.findChoice("1A").click();
    checkVisibility([0, 1], 4);

    l2Choice.findChoice("2A").click();
    checkVisibility([0, 1, 2], 4);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.include({from_name: "level1"});
      expect(result[0].value.choices).to.have.lengthOf(1);
      expect(result[0]).to.nested.include({"value.choices[0]": "1A"});
      expect(result[1]).to.include({from_name: "level2"});
      expect(result[1].value.choices).to.have.lengthOf(1);
      expect(result[1]).to.nested.include({"value.choices[0]": "2A"});
    });

    l3AChoice.findChoice("3X").click();
    checkVisibility([0, 1, 2], 4);

    l1Choice.findChoice("1A").click();
    checkVisibility([0], 4);

    LabelStudio.serialize().then((result) => {
      expect(result).to.have.lengthOf(0);
    });
  });
});
