<script setup lang="ts">
import { onMounted, ref } from "vue";
import InvertedPendulum from "./components/Pendulum/InvertedPendulum.vue";
import TextEditor from "./components/Pendulum/TextEditor.vue";
import {
  usePendulumSimulation,
  type ControllerFunction,
  type State,
} from "./composables/simulation";

import type { PendulumParameters } from "@/composables/pendulum";
import { onKeyStroke } from "@vueuse/core";
import { height } from "@/composables/viewportHeight";

const starter_code = ref(`// Welcome to inverted pendulum control practice
// You can test your own controllers by changing 
// the u returned by controller function



/*
State will be like "initial_state" given below but for the 
current state of the system. 
You are expected to return the input control (Force (N)). 
Try to keep the pendulum upright or achieve the set_state.
*/
function controller(state) {

    // assigning position of the system to x, velocity to v for ease of use.
    const {position: x, velocity: v, pendulumAngle: a, pendulumAngularVelocity: w} = state;
    const {position: setx, velocity: setv, pendulumAngle: seta, pendulumANgularVelocity: setw} = set_state;

    // The K gains were calculated using LQR method to optimally control the system.
    // But if you want you can just return any u and see the system's response.
    // There may be better LQR gains for faster response or less energy consumption.
    // These values depend on Q and R matrices that I semi-arbitrarily chose.
    // So you can technically improve this controller.
    // It can't do a swing up, for example, because it is a linearized controller.
    const K = [-10.000000000000313, -12.92204135993505, -83.85142100969318, -25.832364273590628]

    // notice that I wrote only setx, but if you take out the x control,
    // you can control the velocity with (v-setv)
    let u = -K[0]*clamp(x-setx, 5) -K[1]*v -K[2]*a -K[3]*w
  
    return u
}

const set_state = {
    position: 0, // try setting this to another value and Run (F5)
    velocity: 0, // you can change these but unless you change the controller, it will have no effect.
    pendulumAngle: 0,
    pendulumAngularVelocity: 0,
}

/*
You can change both initial_state and set_state.
You need to click update button after the changes.
You'll also need to click reset if you changed initial_state.
*/
const initial_state = {
    position: 10, // meter
    velocity: 0, // meter/s
    pendulumAngle: 0, // radian
    pendulumAngularVelocity: 0, // radian/s
}


/*
Just a helper function to keep values in check.
if limit is 10, -100 will be -10 and 80 will be 10,
anything that has a smaller absolute value than the limit
will stay the same.
*/
function clamp(value, limit) {
  return Math.sign(value) * Math.min(Math.abs(value), limit)
}

/*
Another helper function but for angles.
keeps the angle between -pi to +pi radian.
If absolute value of an angle is bigger than pi but smaller than 2*pi,
this will represent the same angle from the other war around.
For example, 3.67 radians(210 degrees) becomes -2.62 radians(-150 degrees).
It is redundant for the current system, but if you have a swing up controller and you'll
switch to lqr controller at small angles, this will be useful.
*/
function clampAngle(angle) {
    angle = angle % (Math.PI * 2)
    if (angle > Math.PI) {
      return -(Math.PI*2 - angle)
    } else if (angle < -Math.PI) {
      return Math.PI*2 + angle
    } else {
      return angle
    }
}

// do not delete or rename "controller" or "initial_state".
// you can create any function or variable you like.
// have fun.`);

const controllerFunction = ref<ControllerFunction>(() => {
  return 0;
});

const textEditor = ref<InstanceType<typeof TextEditor>>();

const initialState = ref<State>({
  position: 10,
  velocity: 0,
  pendulumAngle: 0,
  pendulumAngularVelocity: 0,
});

const pendulumParameters = ref<PendulumParameters>({
  ball_mass: 0.3,
  wheel_mass: 0.5,
  wheel_radius: 0.25,
  stick_length: 1,
  force: 0,
  viscous_friction: 0.01,
});

const { state, angleOverride, isRunning, toggle, reset } =
  usePendulumSimulation({
    controllerFunction,
    pendulumParameters,
    initialState,
  });

const editorFullscreen = ref(false);
const showPendulumInFullScreen = ref(true);

function get_user_function(value: string) {
  const last_line = "\nreturn {controller, initial_state}"; // this assumes user has created a function called controller;
  const main = Function(value + last_line);
  return main(); // return the controller function
}

function update_variables(code: string) {
  const { controller, initial_state } = get_user_function(code);
  controllerFunction.value = controller;
  initialState.value = initial_state;
}

onMounted(() => {
  update_variables(starter_code.value);
});
onKeyStroke(["F5"], (e) => {
  e.preventDefault();
  update_variables(starter_code.value);
});
onKeyStroke(["F6"], (e) => {
  e.preventDefault();
  toggle();
});
onKeyStroke(["F7"], (e) => {
  e.preventDefault();
  reset();
});
</script>

<template>
  <div class="flex flex-col h-screen overflow-x-hidden">
    <div
      :class="{
        'show-pendulum-in-fullscreen':
          editorFullscreen && showPendulumInFullScreen,
      }"
    >
      <InvertedPendulum
        :pendulum_angle="state.pendulumAngle"
        @update:pendulum_angle="(angle) => (angleOverride = angle)"
        @dragend="angleOverride = undefined"
        :position="state.position"
        :stick_length="pendulumParameters.stick_length"
        :wheel_diameter="pendulumParameters.wheel_radius * 2"
        :stick_width="pendulumParameters.stick_length / 30"
        :ppm="Math.min(200, height / 2)"
        class="z-10 select-none relative basis-0"
      ></InvertedPendulum>
    </div>
    <div class="relative container mx-auto flex-1">
      <div class="h-full absolute w-full flex flex-col xl:flex-row">
        <div class="w-full xl:w-auto">
          <div class="buttons p-4 flex xl:flex-col gap-4">
            <button
              class="btn primary"
              @click="update_variables(starter_code)"
              title="update controller"
            >
              Run<span class="hidden sm:inline-block pl-1">(F5)</span>
            </button>
            <button
              class="btn"
              title="start or stop simulation"
              :class="{ negative: isRunning, positive: !isRunning }"
              @click="toggle()"
            >
              <template v-if="isRunning"
                >Stop<span class="hidden sm:inline-block pl-1"
                  >(F6)</span
                ></template
              >
              <template v-else
                >Start<span class="hidden sm:inline-block pl-1"
                  >(F6)</span
                ></template
              >
            </button>
            <button
              class="btn negative"
              title="reset pendulum state"
              @click="reset()"
            >
              Reset<span class="hidden sm:inline-block pl-1">(F7)</span>
            </button>
            <div
              class="gap-4 flex flex-col"
              :class="{ 'editor-fullscreen-button': editorFullscreen }"
            >
              <button
                class="btn text-white"
                :class="{
                  positive: !editorFullscreen,
                  negative: editorFullscreen,
                }"
                title="fill the screen with the editor"
                @click="editorFullscreen = !editorFullscreen"
              >
                <span v-if="!editorFullscreen">Editor View</span>
                <span v-else>Exit Editor View</span>
              </button>
              <button
                v-if="editorFullscreen"
                class="btn bg-orange-600 text-white"
                title="fill the screen with the editor"
                @click="showPendulumInFullScreen = !showPendulumInFullScreen"
              >
                <span v-if="!showPendulumInFullScreen">Show pendulum</span>
                <span v-else>Hide pendulum</span>
              </button>
            </div>
          </div>
        </div>
        <div class="relative flex-1">
          <div class="absolute w-full h-full">
            <TextEditor
              class="h-full w-full"
              :class="{ 'editor-fullscreen': editorFullscreen }"
              v-model:model-value="starter_code"
              ref="textEditor"
            ></TextEditor>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.editor-fullscreen {
  position: fixed !important;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
}
.editor-fullscreen-button {
  position: fixed;
  z-index: 110;
  right: 30px;
  top: 10px;
}
.show-pendulum-in-fullscreen {
  position: fixed !important;
  z-index: 110 !important;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  .head {
    pointer-events: visible;
  }
}
</style>
