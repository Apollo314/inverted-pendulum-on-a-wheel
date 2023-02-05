# Inverted pendulum on a wheel

This is a nonlinear inverted pendulum simulation that visitors can change the controller in real time.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

# System parameters

System parameters like mass of the wheel or the ball is located in lqr_gains_solver.py along with a linearized state space representation of the system.

# Simulation

Simulation happens via Runge–Kutta–Fehlberg method or RK4(5) method. it runs about 60 times a second.

# Inverted Pendulum On a Wheel

It is slightly different than an inverted pendulum on a cart because we also have a rotating wheel with inertia. but other than that, everything is pretty much the same.