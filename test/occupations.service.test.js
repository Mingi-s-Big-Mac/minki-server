import { describe, expect, it } from 'vitest';

import { createOccupationsService } from '../src/modules/occupations/occupations.service.js';

describe('occupations service', () => {
  it('rejects invalid compare counts and duplicate IDs', async () => {
    const service = createOccupationsService({});

    await expect(service.compare(['a'])).rejects.toMatchObject({ code: 'COMPARE_MIN_COUNT' });
    await expect(service.compare(['a', 'b', 'c', 'd', 'e'])).rejects.toMatchObject({
      code: 'COMPARE_MAX_COUNT',
    });
    await expect(service.compare(['a', 'a'])).rejects.toMatchObject({
      code: 'COMPARE_DUPLICATE_ID',
    });
  });

  it('returns compare items in requested order', async () => {
    const service = createOccupationsService({
      findManyByIds: async () => [
        { id: 'b', name: 'B' },
        { id: 'a', name: 'A' },
      ],
    });

    await expect(service.compare(['a', 'b'])).resolves.toEqual([
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ]);
  });
});
