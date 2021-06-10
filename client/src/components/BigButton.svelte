<script lang="ts">
  export let isSmall: boolean;
</script>

<button class="big-button" class:is-small={isSmall} on:click>
  <span>Whats cooking?</span>
</button>

<style>
  .big-button {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: unset;
    font-size: 2em;
    color: white;
    text-transform: uppercase;
    border: 2px solid rgb(255, 85, 85);
    transition: transform 500ms;
  }

  .is-small {
    /* width: 100px;
    height: 100px; */
    transform: scale(0.7);
  }

  .is-small span {
    font-size: 1rem;
  }
</style>
