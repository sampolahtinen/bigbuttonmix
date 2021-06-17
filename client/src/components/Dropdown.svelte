<script lang="ts">
  import Select from "svelte-select";

  type DropdownOption = {
    value: string;
    label: string;
    groupBy?: string;
  };

  export let items: DropdownOption[] = [];
  export let groupBy: (param: DropdownOption) => string;
</script>

<div class="b-dropdown">
  <Select
    on:select
    containerStyles="text-align: left; background: transparent;"
    placeholder="Choose city"
    {items}
    {groupBy}
  />
</div>

<style>
  .b-dropdown {
    --listBackground: transparent;
    --placeholderColor: black;
    --border: 1px solid black;
    --borderFocusColor: 1px solid black;
    --itemHoverBG: rgba(255, 255, 255, 0.137);
    width: 80%;
    max-width: 250px;
    background: transparent;
    color: white;
  }
</style>
