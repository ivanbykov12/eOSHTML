import React, { ComponentType, Suspense, lazy } from 'react';

interface SafeLazyComponentProps {
  componentLoader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  onComponentMissing?: () => void;
  [key: string]: any;
}

// Функция для безопасной ленивой загрузки компонентов
export function safeLazyLoad(
  componentLoader: () => Promise<{ default: ComponentType<any> }>,
  onComponentMissing?: () => void
) {
  const LazyComponent = lazy(async () => {
    try {
      const module = await componentLoader();
      return module;
    } catch (error) {
      console.warn('Component failed to load:', error);
      if (onComponentMissing) {
        onComponentMissing();
      }
      // Возвращаем пустой компонент вместо ошибки
      return {
        default: () => null
      };
    }
  });

  return LazyComponent;
}

// Компонент-обёртка для безопасного рендеринга
export const SafeLazyComponent: React.FC<SafeLazyComponentProps> = ({
  componentLoader,
  fallback,
  onComponentMissing,
  ...props
}) => {
  const LazyComponent = React.useMemo(
    () => safeLazyLoad(componentLoader, onComponentMissing),
    [componentLoader, onComponentMissing]
  );

  return (
    <Suspense fallback={fallback || null}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Утилита для проверки доступности компонента
export async function checkComponentAvailability(
  componentLoader: () => Promise<{ default: ComponentType<any> }>
): Promise<boolean> {
  try {
    await componentLoader();
    return true;
  } catch (error) {
    return false;
  }
}
