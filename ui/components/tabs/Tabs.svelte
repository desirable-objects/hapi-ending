<div class="tabs">
  <div class="label" on:click="set({ selected: 'browser' })">Browser/Node Fetch</div>
  <div class="tab" class:shown="selected === 'browser'">
    <slot name="browser"></slot>
  </div>
  
  <div class="label" on:click="set({ selected: 'node' })">Got</div>
  <div class="tab" class:shown="selected === 'node'">
    <slot name="node"></slot>
  </div>
  
  <div class="label" on:click="set({ selected: 'curl' })">cURL</div>
  <div class="tab" class:shown="selected === 'curl'">
    <slot name="curl"></slot>
  </div>
</div>

<style>
  .tabs {
    display: flex;
    flex-wrap: wrap;
    margin: 24px 0;
  }

  .label {
    order: 1;
    display: block;
    padding: 1rem 2rem;
    margin-right: 0.2rem;
    cursor: pointer;
    background: #90CAF9;
    font-weight: bold;
    transition: background ease 0.2s;
  }

  .tabs .tab {
    order: 99;
    flex-grow: 1;
    width: 100%;
    display: none;
    padding: 1rem;
    background: #fff;
  }

  .tabs .tab.shown {
    display: block;
  }

  @media (max-width: 45em) {
    .tabs .tab,
    .tabs label {
      order: initial;
    }

    .tabs label {
      width: 100%;
      margin-right: 0;
      margin-top: 0.2rem;
    }
  }
</style>

<script>
  export default {
    data () {
      return {
        selected: 'curl'
      }
    }
  }
</script>