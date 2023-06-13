<template>
  <div
    class="viewport"
    :style="{
      translate: `${beingHandled ? -lastPos * ppm : -position * ppm}px`,
      paddingTop: `${stick_length * ppm}px`,
    }"
  >
    <div>
      <div
        class="bottom relative flex justify-center"
        :style="{
          translate: `${position * ppm}px`,
        }"
      >
        <img
          class="wheel"
          src="@/assets/wheel.svg"
          :width="wheel_diameter * ppm"
          :height="wheel_diameter * ppm"
          :style="{ rotate: `${wheel_rotation}rad` }"
          alt="Wheel"
        />
        <div
          class="absolute flex justify-center"
          ref="bodyParentRef"
          :style="{
            width: `${wheel_diameter * ppm}px`,
            height: `${wheel_diameter * ppm}px`,
            rotate: `${pendulum_angle}rad`,
          }"
        >
          <div
            class="absolute"
            :style="{ bottom: `${(wheel_diameter / 2 - stick_width) * ppm}px` }"
          >
            <div class="body flex justify-center relative">
              <svg
                :width="stick_width * 2 * ppm"
                :height="(stick_length + stick_width) * ppm"
              >
                <rect
                  :width="stick_width * ppm"
                  :x="(stick_width / 2) * ppm"
                  :height="stick_length * ppm"
                  fill="#ffb871"
                  stroke="#a57647"
                  stroke-width="2px"
                />
                <circle
                  fill="#ffb871"
                  :cx="stick_width * ppm"
                  stroke="#a57647"
                  stroke-width="2px"
                  :cy="stick_length * ppm"
                  :r="stick_width * ppm - 1"
                />
              </svg>
              <div
                class="absolute"
                :style="{
                  top: `-${(wheel_diameter / 3 / 2) * ppm}px`,
                  height: `${(wheel_diameter / 3) * ppm}px`,
                  width: `${(wheel_diameter / 3) * ppm}px`,
                }"
              >
                <svg
                  :width="(wheel_diameter / 1.5) * ppm"
                  :height="(wheel_diameter / 1.5) * ppm"
                  style="position: absolute; z-index: 200"
                  :style="{
                    top: `${
                      (-wheel_diameter * (1 / 3 - 1 / 12) * ppm) / 1.5
                    }px`,
                    left: `${
                      (-wheel_diameter * (1 / 3 - 1 / 12) * ppm) / 1.5
                    }px`,
                  }"
                >
                  <circle
                    ref="headBallRef"
                    class="head"
                    opacity="0"
                    :cx="(wheel_diameter / 1.5 / 2) * ppm"
                    :cy="(wheel_diameter / 1.5 / 2) * ppm"
                    :r="(wheel_diameter / 1.5 / 2) * ppm"
                  />
                </svg>
                <svg
                  :style="{ rotate: `${-pendulum_angle}rad` }"
                  :width="(wheel_diameter / 3) * ppm"
                  :height="(wheel_diameter / 3) * ppm"
                >
                  <circle
                    fill="url('#head-gradient')"
                    :cx="(wheel_diameter / 3 / 2) * ppm"
                    :cy="(wheel_diameter / 3 / 2) * ppm"
                    :r="(wheel_diameter / 3 / 2) * ppm"
                  />
                  <defs>
                    <radialGradient cx="40%" cy="35%" id="head-gradient">
                      <stop offset="10%" stop-color="#909090" />
                      <stop offset="95%" stop-color="#303030" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FancyRuler :position="position" :ppm="ppm"></FancyRuler>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDraggable } from "@vueuse/core";
import { computed, ref } from "vue";
import FancyRuler from "./FancyRuler.vue";

const props = withDefaults(
  defineProps<{
    position?: number;
    pendulum_angle?: number;
    stick_length?: number;
    stick_width?: number;
    wheel_diameter?: number;
    /**
     * pixel per meter (how many pixels should represent a meter)
     */
    ppm?: number;
  }>(),
  {
    position: 0,
    pendulum_angle: 0,
    stick_length: 2,
    stick_width: 0.06,
    wheel_diameter: 1,
    ppm: 100,
  }
);

const emit = defineEmits<{
  (e: "update:pendulum_angle", value: number): void;
  (e: "dragend"): void;
}>();

const headBallRef = ref<SVGElement>();
const bodyParentRef = ref<HTMLElement>();
const lastPos = ref<number>(props.position || 0);
const beingHandled = ref<boolean>(false);
const lastMousePos = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const humanControllerInterval = ref<number>();
const onEndTimeout = ref<number>();
const onEndInterval = ref<number>();

function getCenter(rect: DOMRect): { x: number; y: number } {
  return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
}

useDraggable(headBallRef, {
  onStart: (_, event) => {
    clearInterval(humanControllerInterval.value);
    if (onEndInterval.value !== undefined) {
      clearInterval(onEndInterval.value);
      clearTimeout(onEndTimeout.value);
      onEndInterval.value = undefined;
    } else {
      lastPos.value = props.position;
    }
    lastMousePos.value = { x: event.x, y: event.y };
    beingHandled.value = true;
    humanControllerInterval.value = setInterval(() => {
      const bodyRect = bodyParentRef.value?.getBoundingClientRect();
      if (bodyRect) {
        const bodyPos = getCenter(bodyRect);
        const pendAngle = Math.atan2(
          -bodyPos.x + lastMousePos.value.x,
          bodyPos.y - lastMousePos.value.y
        );
        emit("update:pendulum_angle", pendAngle);
      }
    }, 20);
  },
  onMove: (_, event) => {
    lastMousePos.value = { x: event.x, y: event.y };
  },
  onEnd() {
    let tstart = Date.now();
    let lastPosBeforeInterval = lastPos.value;
    onEndInterval.value = setInterval(() => {
      const t = Date.now() - tstart;
      lastPos.value =
        (lastPosBeforeInterval * (2000 - t) + props.position * t) / 2000;
    }, 10);
    onEndTimeout.value = setTimeout(() => {
      clearInterval(onEndInterval.value);
      beingHandled.value = false;
    }, 2000);
    clearInterval(humanControllerInterval.value);
    emit("dragend");
  },
});

const wheel_rotation = computed(() => {
  return (props.position / props.wheel_diameter) * 2;
});
</script>

<style scoped lang="scss">
.head {
  cursor: grab;
  background: radial-gradient(#404040, #ffb871);
}
</style>
