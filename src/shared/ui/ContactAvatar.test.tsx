import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContactAvatar } from './ContactAvatar';

describe('ContactAvatar', () => {
  it('shows the group icon from data, whatever the group is named', () => {
    const group = renderToStaticMarkup(<ContactAvatar name="Một nhóm mới bất kỳ" isGroup />);
    const person = renderToStaticMarkup(<ContactAvatar name="Một nhóm mới bất kỳ" />);
    expect(group).toContain('<svg');
    expect(person).not.toContain('<svg');
  });
});
