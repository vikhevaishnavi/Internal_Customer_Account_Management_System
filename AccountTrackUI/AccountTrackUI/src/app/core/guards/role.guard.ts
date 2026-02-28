import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Only access localStorage if we are in the browser
  if (isPlatformBrowser(platformId)) {
    const userRole = localStorage.getItem('role');
    const expectedRole = route.data['role'];

    if (userRole === expectedRole) {
      return true;
    }
    
    alert('Access Denied: You do not have permission for this task.');
    router.navigate(['/login']);
    return false;
  }

  // If on server, allow the route to pass so the browser can take over
  return true;
};