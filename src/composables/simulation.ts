import { matrix } from "mathjs";
import { computed, onMounted, onUnmounted, ref, unref, type Ref } from "vue";
import { pendulum, type PendulumParameters } from "./pendulum";
import { rkf45 } from "./runge";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type State = {
  position: number;
  velocity: number;
  pendulumAngle: number;
  pendulumAngularVelocity: number;
};

type SystemParameters = {};

export type ControllerFunction = {
  (state: State, systemParameters: SystemParameters): number;
};

type PendulumConfig = {
  controllerFunction: Ref<ControllerFunction>;
  pendulumParameters: Ref<PendulumParameters>;
  initialState: Ref<State>;
};

export function usePendulumSimulation(config: PendulumConfig) {
  const state = ref<State>({ ...config.initialState.value });
  const state_matrix = ref(
    matrix([
      state.value["position"],
      state.value["velocity"],
      state.value["pendulumAngle"],
      state.value["pendulumAngularVelocity"],
    ])
  );
  const run = ref(false);
  const angleOverride = ref<number>(); // for user mouse disturbance.
  let update_time = Date.now();
  async function main() {
    while (run.value) {
      await sleep(Math.floor(1000 / 60));
      const controllerFunction = unref(config["controllerFunction"]);
      const state_array = <number[]>state_matrix.value.toArray();
      const state_obj = {
        position: state_array[0],
        velocity: state_array[1],
        pendulumAngle: state_array[2],
        pendulumAngularVelocity: state_array[3],
      };
      const force = controllerFunction(
        state_obj,
        config["pendulumParameters"].value
      );

      if (angleOverride.value) {
        state_matrix.value.set([2], angleOverride.value);
      }

      const newstate = rkf45(pendulum, 0, state_matrix.value, 1 / 60, {
        ...config["pendulumParameters"].value,
        force: force,
      });
      state_matrix.value = newstate;

      if (Date.now() - update_time > 1000 / 60) {
        state.value = state_obj;
        update_time = Date.now();
      }
      if (Math.abs(state_array[0]) > 1000000) {
        reset();
      }
    }
  }
  function reset() {
    state.value = { ...config.initialState.value };
    state_matrix.value = matrix([
      state.value["position"],
      state.value["velocity"],
      state.value["pendulumAngle"],
      state.value["pendulumAngularVelocity"],
    ]);
  }
  function stop() {
    run.value = false;
  }
  function start() {
    if (!run.value) {
      run.value = true;
      main();
    }
  }
  function toggle() {
    if (run.value) {
      stop();
    } else {
      start();
    }
  }
  const isRunning = computed(() => {
    return run.value;
  });
  onMounted(() => {
    start();
  });
  onUnmounted(() => {
    stop();
  });
  return {
    state,
    state_matrix,
    stop,
    start,
    toggle,
    reset,
    isRunning,
    angleOverride,
  };
}
