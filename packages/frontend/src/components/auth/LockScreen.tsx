import React, { useState, useEffect, useCallback } from 'react';
import { useUsuarios } from '../../queries/auth/queries.ts';
import { useLoginPin, useLoginPassword } from '../../queries/auth/mutations.ts';
import { useAuth } from '../../lib/auth-context.tsx';
import type { Usuario } from '../../api/types.ts';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Avatar, AvatarFallback } from '../ui/avatar.tsx';
import { Alert, AlertDescription } from '../ui/alert.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group.tsx';
import { Card } from '../ui/card.tsx';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { Field, FieldLabel } from '../ui/field.tsx';
import {
  Lock,
  Shield,
  Wrench,
  Store,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  Delete,
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface LockScreenProps {
  onSuccess?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onSuccess }) => {
  const { currentUser, login } = useAuth();
  const { data: usuarios = [], isLoading: isLoadingUsuarios, error: usuariosError } = useUsuarios();
  const loginPinMutation = useLoginPin();
  const loginPasswordMutation = useLoginPassword();

  // Selected user for auth attempt
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  // Auth mode for admin/dual users: 'PIN' | 'PASSWORD'
  const [authMode, setAuthMode] = useState<'PIN' | 'PASSWORD'>('PIN');
  const [pinInput, setPinInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If there's an already logged in user, select them by default if desired
  useEffect(() => {
    if (currentUser && usuarios.length > 0 && !selectedUser) {
      const match = usuarios.find((u) => u.id === currentUser.id && u.activo);
      if (match) {
        setSelectedUser(match);
      }
    }
  }, [currentUser, usuarios, selectedUser]);

  // Reset inputs when switching user
  const handleSelectUser = (user: Usuario) => {
    setSelectedUser(user);
    setPinInput('');
    setPasswordInput('');
    setErrorMessage(null);
    // If user has no PIN but has password, switch to password
    if (!user.hasPin && user.hasPassword) {
      setAuthMode('PASSWORD');
    } else {
      setAuthMode('PIN');
    }
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
    setPinInput('');
    setPasswordInput('');
    setErrorMessage(null);
  };

  const isSubmitting = loginPinMutation.isPending || loginPasswordMutation.isPending;

  // Expected PIN length: 6 for ADMIN, 4 for others
  const expectedPinLength = selectedUser?.rol === 'ADMIN' ? 6 : 4;

  const handlePinSubmit = useCallback(
    async (pinToSubmit: string) => {
      if (!selectedUser || isSubmitting || !pinToSubmit.trim()) return;

      setErrorMessage(null);
      try {
        const response = await loginPinMutation.mutateAsync({
          usuarioId: selectedUser.id,
          pin: pinToSubmit.trim(),
        });
        login(response.user);
        onSuccess?.();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error al autenticar con PIN');
        setPinInput('');
      }
    },
    [selectedUser, isSubmitting, loginPinMutation, login, onSuccess]
  );

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || isSubmitting || !passwordInput.trim()) return;

    setErrorMessage(null);
    try {
      const response = await loginPasswordMutation.mutateAsync({
        usuarioId: selectedUser.id,
        password: passwordInput.trim(),
      });
      login(response.user);
      onSuccess?.();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al autenticar con contraseña');
    }
  };

  // Handle Keypad button press
  const handleKeypadPress = (digit: string) => {
    if (isSubmitting) return;
    if (pinInput.length < expectedPinLength) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === expectedPinLength) {
        handlePinSubmit(nextPin);
      }
    }
  };

  const handleKeypadBackspace = () => {
    if (isSubmitting) return;
    setPinInput((prev) => prev.slice(0, -1));
  };

  // Keyboard listener for desktop PIN typing
  useEffect(() => {
    if (!selectedUser || authMode !== 'PIN') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeypadBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleBackToUserList();
      } else if (e.key === 'Enter' && pinInput.length > 0) {
        e.preventDefault();
        handlePinSubmit(pinInput);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUser, authMode, pinInput, expectedPinLength, handlePinSubmit]);

  const activeUsuarios = usuarios.filter((u) => Boolean(u.activo));

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return {
          label: 'Administrador',
          icon: <Shield className="size-3" />,
          color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
          avatarBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
        };
      case 'TECNICO':
        return {
          label: 'Técnico',
          icon: <Wrench className="size-3" />,
          color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800',
          avatarBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-300',
        };
      case 'MOSTRADOR':
      default:
        return {
          label: 'Mostrador',
          icon: <Store className="size-3" />,
          color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
          avatarBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg p-6 sm:p-8 rounded-xl border border-border bg-card shadow-none transition-all">
        {/* Header de la Pantalla de Bloqueo */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {selectedUser ? `Hola, ${selectedUser.nombre}` : 'Estación de Trabajo'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-normal">
            {selectedUser
              ? selectedUser.rol === 'ADMIN'
                ? 'Ingresa tu PIN de 6 dígitos o tu contraseña'
                : 'Ingresa tu PIN de 4 dígitos para continuar'
              : 'Selecciona tu usuario para iniciar turno o sesión'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle className="size-4 shrink-0" />
            <AlertDescription className="font-medium text-xs">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* PASO 1: Selección de Usuario */}
        {!selectedUser ? (
          <div>
            {isLoadingUsuarios ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Spinner className="size-6 text-primary" />
                <span className="text-xs">Cargando usuarios activos...</span>
              </div>
            ) : usuariosError ? (
              <div className="py-8 text-center text-xs text-destructive">
                Error al cargar usuarios. Verifica la conexión con el servidor.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
                {activeUsuarios.map((user) => {
                  const badge = getRoleBadge(user.rol);
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border bg-card hover:border-foreground/40 text-left transition-all group focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    >
                      <Avatar
                        className="size-11 rounded-full flex items-center justify-center font-semibold text-sm border border-border bg-muted/60 text-foreground shrink-0 group-hover:scale-105 transition-transform"
                      >
                        <AvatarFallback>{user.nombre.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {user.nombre}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] gap-1 font-normal rounded-full"
                          >
                            {badge.icon}
                            {badge.label}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* PASO 2: Ingreso de PIN / Contraseña */
          <div>
            {/* Tarjeta del usuario seleccionado con botón de volver */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/40 border border-border/60 mb-5">
              <div className="flex items-center gap-2.5">
                <Avatar
                  className={cn(
                    'size-9 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0',
                    getRoleBadge(selectedUser.rol).avatarBg
                  )}
                >
                  <AvatarFallback>{selectedUser.nombre.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-xs text-foreground truncate max-w-[200px]">
                    {selectedUser.nombre}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {getRoleBadge(selectedUser.rol).label}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToUserList}
                disabled={isSubmitting}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" data-icon="inline-start" />
                <span>Cambiar</span>
              </Button>
            </div>

            {/* Alternador de Modo para Admin / Usuarios con contraseña */}
            {selectedUser.hasPassword && selectedUser.hasPin && (
              <div className="mb-5 flex justify-center">
                <Tabs
                  value={authMode}
                  onValueChange={(val) => {
                    setAuthMode(val as 'PIN' | 'PASSWORD');
                    setErrorMessage(null);
                  }}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-2 h-9">
                    <TabsTrigger value="PIN" className="text-xs gap-1.5">
                      <KeyRound className="size-3.5" />
                      <span>PIN ({expectedPinLength} dígitos)</span>
                    </TabsTrigger>
                    <TabsTrigger value="PASSWORD" className="text-xs gap-1.5">
                      <Shield className="size-3.5" />
                      <span>Contraseña Remota</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Sub-vista A: Teclado numérico PIN */}
            {authMode === 'PIN' ? (
              <div className="flex flex-col items-center">
                {/* Indicadores visuales de puntos (PIN dots) */}
                <div className="flex items-center justify-center gap-3 my-4">
                  {Array.from({ length: expectedPinLength }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'size-3.5 rounded-full border transition-all duration-150',
                        i < pinInput.length
                          ? 'bg-primary border-primary scale-110'
                          : 'border-muted-foreground/30 bg-muted/20'
                      )}
                    />
                  ))}
                </div>

                {/* Teclado táctil en pantalla (Grid 3x4) */}
                <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px] my-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <Button
                      key={digit}
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => handleKeypadPress(digit)}
                      className="h-13 text-lg font-normal rounded-full border-border bg-card hover:bg-muted/50 active:scale-[0.95]"
                    >
                      {digit}
                    </Button>
                  ))}

                  {/* Fila inferior: Borrar, 0, Enviar */}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || pinInput.length === 0}
                    onClick={handleKeypadBackspace}
                    className="h-13 rounded-full border-border bg-card text-muted-foreground hover:text-foreground active:scale-[0.95]"
                    title="Borrar dígito"
                  >
                    <Delete className="size-5" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => handleKeypadPress('0')}
                    className="h-13 text-lg font-normal rounded-full border-border bg-card hover:bg-muted/50 active:scale-[0.95]"
                  >
                    0
                  </Button>

                  <Button
                    type="button"
                    disabled={isSubmitting || pinInput.length === 0}
                    onClick={() => handlePinSubmit(pinInput)}
                    className="h-13 rounded-full font-normal active:scale-[0.95]"
                    title="Confirmar PIN"
                  >
                    {isSubmitting ? (
                      <Spinner className="size-5" />
                    ) : (
                      <Check className="size-5" />
                    )}
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground mt-3 font-normal">
                  Puedes escribir directamente con el teclado numérico de tu PC
                </p>
              </div>
            ) : (
              /* Sub-vista B: Contraseña tradicional para ADMIN / Remoto */
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 pt-1">
                <Field>
                  <FieldLabel htmlFor="pwd-field" className="text-xs">
                    Contraseña tradicional
                  </FieldLabel>
                  <InputGroup className="h-9">
                    <InputGroupInput
                      id="pwd-field"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      disabled={isSubmitting}
                      autoFocus
                      required
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <Button
                  type="submit"
                  disabled={isSubmitting || !passwordInput.trim()}
                  className="w-full gap-2 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="size-4" data-icon="inline-start" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="size-4" data-icon="inline-start" />
                      <span>Ingresar como Administrador</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
