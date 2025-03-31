import { AuthenticationInterceptor } from './authentication.interceptor';

describe('AuthenticationInterceptor', () => {
  it('should be defined', () => {
    expect(new AuthenticationInterceptor()).toBeDefined();
  });
});
