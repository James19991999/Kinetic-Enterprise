import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useDismissableMenu } from '@/hooks/useDismiss';

function setup(isOpen: boolean, onClose: () => void) {
  const { result } = renderHook(() => useDismissableMenu<HTMLDivElement>(isOpen, onClose));
  const container = document.createElement('div');
  document.body.appendChild(container);
  // @ts-expect-error -- assigning a real DOM node to the ref for the test
  result.current.current = container;
  return container;
}

describe('useDismissableMenu', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('calls onClose when clicking outside the referenced element', () => {
    const onClose = jest.fn();
    setup(true, onClose);

    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the referenced element', () => {
    const onClose = jest.fn();
    const container = setup(true, onClose);

    fireEvent.mouseDown(container);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    setup(true, onClose);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does nothing when isOpen is false', () => {
    const onClose = jest.fn();
    setup(false, onClose);

    fireEvent.mouseDown(document.body);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
