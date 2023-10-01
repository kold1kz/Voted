export const timePeriods: {
  tableTime: string;
  count: number | null;
  available: {
    from: {
      hours: number;
      minutes: number;
    };
    to: {
      hours: number;
      minutes: number;
    };
  };
  withNextDay: boolean;
  partOfDay: 'morning' | 'day' | 'evening' | 'result';
  status: 'waiting' | 'fail' | 'success';
}[] = [
  {
    tableTime: '12:00',
    count: null,
    available: {
      from: {
        hours: 11,
        minutes: 30,
      },
      to: {
        hours: 11,
        minutes: 45,
      },
    },
    withNextDay: false,
    partOfDay: 'morning',
    status: 'waiting',
  },
  {
    tableTime: '15:00',
    count: null,
    available: {
      from: {
        hours: 14,
        minutes: 30,
      },
      to: {
        hours: 14,
        minutes: 45,
      },
    },
    withNextDay: false,
    partOfDay: 'day',
    status: 'waiting',
  },
  {
    tableTime: '18:00',
    count: null,
    available: {
      from: {
        hours: 17,
        minutes: 30,
      },
      to: {
        hours: 17,
        minutes: 45,
      },
    },
    withNextDay: false,
    partOfDay: 'evening',
    status: 'waiting',
  },
  {
    tableTime: 'result',
    count: null,
    available: {
      from: {
        hours: 20,
        minutes: 0,
      },
      to: {
        hours: 8,
        minutes: 45,
      },
    },
    withNextDay: true,
    partOfDay: 'result',
    status: 'waiting',
  },
];
