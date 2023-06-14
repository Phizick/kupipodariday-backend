import { CacheModuleOptions } from '@nestjs/common';

const cacheConfig: CacheModuleOptions = {
  ttl: 180,
};

export default cacheConfig;
