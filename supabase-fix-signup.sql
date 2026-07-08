-- ============================================
-- FIX: Автоматическое создание профиля при регистрации
-- Выполните это в SQL Editor
-- ============================================

-- 1. Создать функцию которая создаёт профиль учителя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teachers (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Создать trigger на auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Убрать старую политику INSERT (она больше не нужна)
DROP POLICY IF EXISTS "Users can insert own profile" ON teachers;

-- Готово! Теперь профиль создаётся автоматически при регистрации
