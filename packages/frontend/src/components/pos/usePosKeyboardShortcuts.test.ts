import { describe, it, expect, mock } from 'bun:test';
import { handlePosKeyboardEvent } from './usePosKeyboardShortcuts.ts';

describe('usePosKeyboardShortcuts - Global POS Accelerators', () => {
  it('executes accelerators on function keys', () => {
    const onFocusSearch = mock(() => {});
    const onOpenCustomerSearch = mock(() => {});
    const onHoldOrRestoreCart = mock(() => {});
    const onCheckout = mock(() => {});
    const onEscape = mock(() => {});

    const options = {
      onFocusSearch,
      onOpenCustomerSearch,
      onHoldOrRestoreCart,
      onCheckout,
      onEscape,
      canCheckout: true,
      isModalOpen: false,
    };

    // Test F2
    const f2Event = { key: 'F2', preventDefault: mock(() => {}) };
    handlePosKeyboardEvent(f2Event, options);
    expect(f2Event.preventDefault).toHaveBeenCalled();
    expect(onFocusSearch).toHaveBeenCalledTimes(1);

    // Test F4
    const f4Event = { key: 'F4', preventDefault: mock(() => {}) };
    handlePosKeyboardEvent(f4Event, options);
    expect(f4Event.preventDefault).toHaveBeenCalled();
    expect(onOpenCustomerSearch).toHaveBeenCalledTimes(1);

    // Test F8
    const f8Event = { key: 'F8', preventDefault: mock(() => {}) };
    handlePosKeyboardEvent(f8Event, options);
    expect(f8Event.preventDefault).toHaveBeenCalled();
    expect(onHoldOrRestoreCart).toHaveBeenCalledTimes(1);

    // Test F9 when canCheckout is true
    const f9Event = { key: 'F9', preventDefault: mock(() => {}) };
    handlePosKeyboardEvent(f9Event, options);
    expect(f9Event.preventDefault).toHaveBeenCalled();
    expect(onCheckout).toHaveBeenCalledTimes(1);

    // Test Escape
    const escEvent = { key: 'Escape', preventDefault: mock(() => {}) };
    handlePosKeyboardEvent(escEvent, options);
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('suppresses F9 checkout when canCheckout is false', () => {
    const onCheckout = mock(() => {});
    const options = {
      onFocusSearch: () => {},
      onOpenCustomerSearch: () => {},
      onHoldOrRestoreCart: () => {},
      onCheckout,
      canCheckout: false,
      isModalOpen: false,
    };

    const f9Event = { key: 'F9', preventDefault: mock(() => {}) };
    handlePosKeyboardEvent(f9Event, options);
    expect(f9Event.preventDefault).toHaveBeenCalled();
    expect(onCheckout).not.toHaveBeenCalled();
  });

  it('ignores all function keys when a modal is actively open', () => {
    const onFocusSearch = mock(() => {});
    const options = {
      onFocusSearch,
      onOpenCustomerSearch: () => {},
      onHoldOrRestoreCart: () => {},
      onCheckout: () => {},
      canCheckout: true,
      isModalOpen: true, // Modal is active
    };

    const f2Event = { key: 'F2', preventDefault: mock(() => {}) };
    handlePosKeyboardEvent(f2Event, options);
    expect(f2Event.preventDefault).not.toHaveBeenCalled();
    expect(onFocusSearch).not.toHaveBeenCalled();
  });
});
