<script lang="ts">
  export let isSmall: boolean;
  export let isLoading: boolean;
</script>

<button class="big-button" class:is-small={isSmall} class:is-loading={isLoading} on:click>
  <span>GO!</span>
</button>

<style>
  
  .big-button {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: unset;
    font-size: 2.5em;
    color: white;
    text-transform: uppercase;
    border: 2px solid rgb(255, 85, 85);
    transition: transform 500ms;
  }

  .is-small {
    transform: scale(0.7);
  }

  .is-loading {
    animation: pulse 2s infinite ease-in-out;
  }

  .is-small span {
    font-size: 1rem;
  }

  @keyframes pulse {
  0% {
    border-color: #FFF;
    color: #FFF;
  }
  50% {
    border-color: #ff403670;
    color: #ff403670;
  }
  100% {
    border-color: #FF4136;
    color: #FF4136;
  }
}
</style>
