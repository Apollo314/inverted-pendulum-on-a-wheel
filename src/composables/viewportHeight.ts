import { ref } from "vue";

export const height = ref(window.innerHeight);

function handleResize(event: any) {
  // Update the window height ref when the window is resized
  height.value = event.target.height;
}

// Add a listener for the "resize" event on the window's visualViewport
window?.visualViewport?.addEventListener("resize", handleResize);
