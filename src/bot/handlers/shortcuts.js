export const shortcuts = {
  // Clearing: مسح
  'مسح': {
    command: 'purge',
    allowedRoles: ['1545277913077907558', '1545277921109745764'],
  },

  // Timeout: صمها، اسكت، اص
  'صمها': {
    command: 'timeout',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },
  'اسكت': {
    command: 'timeout',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },
  'اص': {
    command: 'timeout',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },

  // Warn: تحذير، ت
  'تحذير': {
    command: 'warn',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },
  'ت': {
    command: 'warn',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },

  // Warns list: تحذيرات @username
  'تحذيرات': {
    command: 'warns-list',
    allowedRoles: ['1545277937836761128', '1545277913077907558', '1545277921109745764'],
  },

  // Give/Remove role: ر، رول @username
  'ر': {
    command: 'role',
    allowedRoles: ['1545277913077907558', '1545277888897617940'],
  },
  'رول': {
    command: 'role',
    allowedRoles: ['1545277913077907558', '1545277888897617940'],
  },

  // Lock channel: ق
  'ق': {
    command: 'lock',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },

  // Unlock channel: ف
  'ف': {
    command: 'unlock',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },

  // Kick: برا
  'برا': {
    command: 'kick',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },

  // Ban: بنعالي، كسرة، بان
  'بنعالي': {
    command: 'ban',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },
  'كسرة': {
    command: 'ban',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },
  'بان': {
    command: 'ban',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },
};

export function getShortcutData(shortcut) {
  return shortcuts[shortcut];
}

export function isAllowedToUseShortcut(shortcutData, userRoles) {
  return shortcutData.allowedRoles.some((roleId) => userRoles.includes(roleId));
}
