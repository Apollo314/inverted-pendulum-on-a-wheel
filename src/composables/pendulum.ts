import { matrix, type Matrix } from "mathjs";

export type PendulumParameters = {
  force: number;
  stick_length: number;
  ball_mass: number;
  wheel_mass: number;
  wheel_radius: number;
  viscous_friction: number;
};

const g = 9.81;
const mu = 0.1;
const sin = Math.sin;
const cos = Math.cos;

export const default_parameters: PendulumParameters = {
  force: 0,
  stick_length: 2,
  ball_mass: 1,
  wheel_mass: 2,
  wheel_radius: 1,
  viscous_friction: 0.01,
} as const;

export function pendulum(
  t: number,
  yk: Matrix,
  params: Partial<PendulumParameters>
): Matrix {
  const parameters: PendulumParameters = { ...default_parameters, ...params };
  const [, v, a, w] = <number[]>yk.toArray();
  const { stick_length: l, force: F, ball_mass: m, wheel_mass: M } = parameters;
  const xddot =
    (F -
      mu * (M + m) * g * v +
      m * l * w ** 2 * sin(a) -
      m * g * sin(a) * cos(a)) /
    (2 * M + m - m * cos(a) ** 2);
  const addot = (g * sin(a) - xddot * cos(a)) / l;
  return matrix([v, xddot, w, addot]);
}
