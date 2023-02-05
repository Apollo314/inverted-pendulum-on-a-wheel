// import math from "mathjs";
import { add, multiply, type Matrix } from "mathjs";

const m = multiply;

// this is the actual definition. IDK why default definition says
// that it supports only two numbers. it's wrong. this is true.
const a: <T extends math.MathType>(...args: T[]) => T = add;

export function rkf45<FunctionArgs>(
  f: (tk: number, yk: math.Matrix, args: FunctionArgs) => math.Matrix,
  tk: number,
  yk: math.Matrix,
  h: number,
  fargs: FunctionArgs
) {
  const k1 = m(h, f(tk, yk, fargs));
  const k2 = m(h, f(tk + (1 / 4) * h, a(yk, m(1 / 4, k1)), fargs));
  const k3 = m(
    h,
    f(tk + (3 / 8) * h, a(yk, m(3 / 32, k1), m(9 / 32, k2)), fargs)
  );
  const k4 = m(
    h,
    f(
      tk + (12 / 13) * h,
      a(yk, m(1932 / 2197, k1), m(-7200 / 2197, k2), m(7296 / 2197, k3)),
      fargs
    )
  );
  const k5 = m(
    h,
    f(
      tk + h,
      a(yk, m(439 / 216, k1), m(-8, k2), m(3680 / 513, k3), m(-845 / 4104, k4)),
      fargs
    )
  );
  const k6 = m(
    h,
    f(
      tk + (1 / 2) * h,
      a(
        yk,
        m(-8 / 27, k1),
        m(2, k2),
        m(-3544 / 2565, k3),
        m(1859 / 4104, k4),
        m(-11 / 40, k5)
      ),
      fargs
    )
  );
  const yk_next: Matrix = a(
    yk,
    m(16 / 135, k1),
    m(6656 / 12825, k3),
    m(28561 / 56430, k4),
    m(-9 / 50, k5),
    m(2 / 55, k6)
  );
  return yk_next;
}
