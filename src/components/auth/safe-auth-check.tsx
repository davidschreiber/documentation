import React from 'react';
import { AuthCheckProps, ClaimsCheckProps, useIdTokenResult, useUser } from 'reactfire';
import firebase from 'firebase';

// Apply fix while this is not merged https://github.com/FirebaseExtended/reactfire/pull/336
export function SafeClaimsCheck({ user, fallback, children, requiredClaims }: ClaimsCheckProps) {
  const { data } = useIdTokenResult(user, false, { initialData: { claims: {} } });
  const { claims } = data;
  const missingClaims: { [key: string]: { expected: string; actual: string } } = {};

  if (requiredClaims) {
    for (const claim of Object.keys(requiredClaims)) {
      if (requiredClaims[claim] !== claims[claim]) {
        missingClaims[claim] = {
          expected: requiredClaims[claim],
          actual: claims[claim],
        };
      }
    }
  }

  return Object.keys(missingClaims).length === 0 ? <>{children}</> : <>{fallback}</>;
}

// Apply fix while this is not merged https://github.com/FirebaseExtended/reactfire/pull/336
export function SafeAuthCheck({ fallback, children, requiredClaims }: AuthCheckProps): JSX.Element {
  const { data: user } = useUser<firebase.User>();

  if (user) {
    return requiredClaims ? (
      <SafeClaimsCheck user={user} fallback={fallback} requiredClaims={requiredClaims}>
        {children}
      </SafeClaimsCheck>
    ) : (
      <>{children}</>
    );
  }

  return <>{fallback}</>;
}

export function SimpleAuthCheck({ fallback, children, requiredClaims }: AuthCheckProps) {
  return (
    <SafeAuthCheck fallback={fallback} requiredClaims={requiredClaims}>
      {children}
    </SafeAuthCheck>
  );
}
