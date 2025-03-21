const { centerOfBbox } = require("../tests/helpers");
const { I } = inject();

module.exports = {
  _rootSelector: ".lsf-outliner",
  _regionListSelector: ".lsf-outliner-tree",
  _regionListItemSelector: ".lsf-tree__node:not(.lsf-tree__node_type_footer)",
  _regionListItemSelectedSelector: ".lsf-tree-node-selected",
  _regionListItemIndex: ".lsf-outliner-item__index",
  _regionVesibilityActionButton: ".lsf-outliner-item__control_type_visibility button",
  locateOutliner() {
    return locate(this._rootSelector);
  },
  locate(locator) {
    return locator ? locate(locator).inside(this.locateOutliner()) : this.locateOutliner();
  },
  locateRegionList() {
    return this.locate(this._regionListSelector);
  },
  locateRegionItemList(text) {
    if (text) {
      return locate(this._regionListItemSelector).withText(text).inside(this.locateRegionList());
    }
    return locate(this._regionListItemSelector).inside(this.locateRegionList());
  },
  locateRegionItemIndex(idx) {
    return locate(this._regionListItemIndex).withText(`${idx}`).inside(this.locateRegionItemList());
  },
  locateRegionIndex(idx) {
    return this.locateRegionItemList().withDescendant(
      `${locate(this._regionListItemIndex).toXPath()}[text()='${idx}']`,
    );
  },
  locateSelectedItem(locator) {
    const selectedLocator = locate(this._regionListItemSelectedSelector).inside(this.locateRegionList());

    return locator ? selectedLocator.find(locator) : selectedLocator;
  },
  see(text) {
    I.see(text, this._rootSelector);
  },
  dontSee(text) {
    I.dontSee(text, this._rootSelector);
  },
  seeElement(locator) {
    I.seeElement(this.locate(locator));
  },
  seeRegions(count) {
    count && I.seeElement(this.locateRegionItemList().at(count));
    I.dontSeeElement(this.locateRegionItemList().at(count + 1));
  },
  dontSeeRegions(count) {
    count && I.dontSeeElement(this.locateRegionItemList().at(count));
    count === +count && I.dontSeeElement(this.locateRegionItemIndex(count));
    !count && I.see("Regions not added");
  },
  clickRegion(idxOrText) {
    I.click(typeof idxOrText === "number" ? this.locateRegionItemIndex(idx) : this.locateRegionItemList(idxOrText));
  },
  hoverRegion(idxOrText) {
    I.moveCursorTo(
      typeof idxOrText === "number" ? this.locateRegionItemIndex(idx) : this.locateRegionItemList(idxOrText),
    );
  },
  toggleRegionVisibility(idxOrText) {
    // Hover to see action button
    this.hoverRegion(idxOrText);
    // This button exist only for hovered list item
    I.click(locate(this._regionVesibilityActionButton));
  },
  seeSelectedRegion(text = undefined) {
    I.seeElement(text ? this.locateSelectedItem().withText(text) : this.locateSelectedItem());
  },
  dontSeeSelectedRegion(text = undefined) {
    I.dontSeeElement(text ? this.locateSelectedItem().withText(text) : this.locateSelectedItem());
  },
  /**
   * Drag and drop region through the outliner's regions tree
   * @param {number} dragRegionIdx - Index of the dragged region
   * @param {number} dropRegionIdx - Index of the region that will be a drop zone
   * @param {number} [steps=3] - Sends intermediate mousemove events.
   * @returns {Promise<void>}
   */
  async dragAndDropRegion(dragRegionIdx, dropRegionIdx, steps = 3) {
    const fromBbox = await I.grabElementBoundingRect(this.locateRegionItemIndex(dragRegionIdx));
    const toBbox = await I.grabElementBoundingRect(this.locateRegionItemIndex(dropRegionIdx));
    const fromPoint = centerOfBbox(fromBbox);
    const toPoint = {
      x: toBbox.x + toBbox.width / 2,
      y: toBbox.y + (3 * toBbox.height) / 4,
    };

    return await I.dragAndDropMouse(fromPoint, toPoint, "left", steps);
  },
};
