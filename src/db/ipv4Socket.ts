import net from 'node:net';

export class Ipv4Socket extends net.Socket {
  override connect(options: net.SocketConnectOpts, connectionListener?: () => void): this;
  override connect(port: number, host: string, connectionListener?: () => void): this;
  override connect(port: number, connectionListener?: () => void): this;
  override connect(path: string, connectionListener?: () => void): this;
  override connect(
    optionsOrPortOrPath: net.SocketConnectOpts | number | string,
    hostOrListener?: string | (() => void),
    connectionListener?: () => void,
  ): this {
    const listener = typeof hostOrListener === 'function' ? hostOrListener : connectionListener;

    if (typeof optionsOrPortOrPath === 'object') {
      return listener
        ? super.connect(optionsOrPortOrPath, listener)
        : super.connect(optionsOrPortOrPath);
    }

    if (typeof optionsOrPortOrPath === 'string') {
      return listener
        ? super.connect(optionsOrPortOrPath, listener)
        : super.connect(optionsOrPortOrPath);
    }

    if (typeof optionsOrPortOrPath === 'number') {
      if (typeof hostOrListener === 'string') {
        return super.connect({
          port: optionsOrPortOrPath,
          host: hostOrListener,
          family: 4,
        }, listener);
      }
      return listener
        ? super.connect(optionsOrPortOrPath, listener)
        : super.connect(optionsOrPortOrPath);
    }
  }
}
