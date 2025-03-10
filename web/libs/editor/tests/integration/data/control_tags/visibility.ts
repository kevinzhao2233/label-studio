export const simpleVisibleWhenConfig = `<View>
  <Text name="text" value="$text"/>

  <View name="Level 1">
    <Header value="Level 1"/>
    <Choices name="level1" toName="text" choice="single" showInLine="true">
      <Choice value="1A"/>
      <Choice value="1B"/>
    </Choices>
  </View>

  <Choices
    name="level2" toName="text" choice="single" showInLine="true"
    visibleWhen="choice-selected"
    whenTagName="level1"
    whenChoiceValue="1A"
  >
    <Choice value="2A"/>
    <Choice value="2B"/>
  </Choices>

  <Choices
    name="level3" toName="text" choice="single" showInLine="true"
    visibleWhen="choice-selected"
    whenTagName="level2"
    whenChoiceValue="2A"
  >
    <Choice value="3A"/>
    <Choice value="3B"/>
  </Choices>
</View>`;

export const multipleChainedViewsConfig = `<View>
  <Text name="text" value="$text"/>

  <View name="Level 1">
    <Header value="Level 1"/>
    <Choices name="level1" toName="text" choice="single" showInLine="true">
      <Choice value="1A"/>
      <Choice value="1B"/>
    </Choices>
  </View>

  <!-- Level 2 -->
  <View
    name="Level 2"
    visibleWhen="choice-selected"
    whenTagName="level1"
    whenChoiceValue="1A"
  >
    <Header value="Level 2"/>
    <Choices name="level2" toName="text" choice="single" showInLine="true">
      <Choice value="2A"/>
      <Choice value="2B"/>
    </Choices>
  </View>

  <!-- Level 3A -->
  <View
    name="Level 3A"
    visibleWhen="choice-selected"
    whenTagName="level2"
    whenChoiceValue="2A"
  >
    <Header value="Level 3A"/>
    <Choices name="level3A" toName="text" choice="single" showInLine="true">
      <Choice value="3X"/>
      <Choice value="3Y"/>
    </Choices>
  </View>

  <!-- Level 3B -->
  <View
    name="Level 3B"
    visibleWhen="choice-selected"
    whenTagName="level2"
    whenChoiceValue="2B"
  >
    <Header value="Level 3B"/>
    <Choices name="level3B" toName="text" choice="single" showInLine="true">
      <Choice value="3Q"/>
      <Choice value="3W"/>
    </Choices>
  </View>
</View>`;

export const visibilityTextData = {
  text: "This text exists for no reason",
};
