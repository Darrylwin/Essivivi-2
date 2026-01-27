import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

import '../../../../core/routing/app_router.dart';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../domain/entities/user.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../widgets/auth_button.dart';

class OTPVerificationPage extends StatefulWidget {
  static const routeName = '/otp-verification';

  final String email;

  const OTPVerificationPage({
    super.key,
    required this.email,
  });

  @override
  State<OTPVerificationPage> createState() => _OTPVerificationPageState();
}

class _OTPVerificationPageState extends State<OTPVerificationPage> {
  final _otpController = TextEditingController();
  bool _isLoading = false;
  int _resendTimer = 60;
  bool _canResend = false;
  String _timerText = '01:00';

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  void _startResendTimer() {
    _updateTimerText();
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _resendTimer--;
          _updateTimerText();
          if (_resendTimer <= 0) {
            _canResend = true;
          }
        });
        if (_resendTimer > 0) {
          _startResendTimer();
        }
      }
    });
  }

  void _updateTimerText() {
    final minutes = (_resendTimer ~/ 60).toString().padLeft(2, '0');
    final seconds = (_resendTimer % 60).toString().padLeft(2, '0');
    _timerText = '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthLoading) {
          setState(() => _isLoading = true);
        } else if (state is AuthAuthenticated) {
          setState(() => _isLoading = false);
          _redirectBasedOnUserType(state.user, context);
        } else if (state is OtpResent) {
          setState(() {
            _isLoading = false;
            _canResend = false;
            _resendTimer = 60;
          });
          _startResendTimer();
          _showSuccessSnackBar(context, state.message);
        } else if (state is AuthError) {
          setState(() => _isLoading = false);
          _showErrorSnackBar(context, state.message);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Vérification OTP'),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () {
              if (!_isLoading) context.pop();
            },
          ),
        ),
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                AppColor.primaryLight,
                AppColor.background,
              ],
              stops: [0.0, 0.5],
            ),
          ),
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),

                  // Illustration
                  _buildIllustration(context),

                  const SizedBox(height: 32),

                  // Contenu principal
                  _buildMainContent(context),

                  const SizedBox(height: 40),

                  // Section informations
                  _buildInfoSection(context),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildIllustration(BuildContext context) {
    return Container(
      width: 180,
      height: 180,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Center(
        child: Icon(
          Icons.email_outlined,
          size: 80,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }

  Widget _buildMainContent(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 25,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Vérification par email',
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.w700,
                ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 12),

          Text(
            'Un code à 6 chiffres a été envoyé à',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 8),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: AppColor.primarySoft,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColor.primary.withOpacity(0.2),
              ),
            ),
            child: Text(
              widget.email,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
              textAlign: TextAlign.center,
              overflow: TextOverflow.ellipsis,
            ),
          ),

          const SizedBox(height: 32),

          // Champ OTP
          _buildOtpInput(context),

          const SizedBox(height: 24),

          // Bouton de vérification
          AuthButton(
            text: 'Vérifier le code',
            onPressed: () {
              if (_otpController.text.length == 6 && !_isLoading) {
                _verifyOTP();
              }
            },
            isLoading: _isLoading,
            icon: Icons.verified_rounded,
          ),

          const SizedBox(height: 24),

          // Bouton de renvoi
          _buildResendSection(context),

          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildOtpInput(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Code OTP',
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 12),
        PinCodeTextField(
          appContext: context,
          length: 6,
          controller: _otpController,
          keyboardType: TextInputType.number,
          autoFocus: true,
          animationType: AnimationType.fade,
          pinTheme: PinTheme(
            shape: PinCodeFieldShape.box,
            borderRadius: BorderRadius.circular(12),
            fieldHeight: 60,
            fieldWidth: 50,
            activeFillColor: AppColor.primarySoft,
            selectedFillColor: AppColor.primarySoft,
            inactiveFillColor: AppColor.grey50,
            activeColor: Theme.of(context).colorScheme.primary,
            selectedColor: Theme.of(context).colorScheme.primary,
            inactiveColor: AppColor.grey300,
          ),
          textStyle: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
          enableActiveFill: true,
          animationDuration: const Duration(milliseconds: 300),
          onChanged: (value) {
            if (value.length == 6 && !_isLoading) {
              _verifyOTP();
            }
          },
          beforeTextPaste: (text) {
            return text?.length == 6 && int.tryParse(text!) != null;
          },
        ),
      ],
    );
  }

  Widget _buildResendSection(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Vous n\'avez pas reçu le code ? ',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
              ),
        ),
        if (!_canResend)
          Text(
            _timerText,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.w600,
                ),
          )
        else
          TextButton(
            onPressed: !_isLoading ? _resendOTP : null,
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: Size.zero,
            ),
            child: Text(
              'Renvoyer',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
      ],
    );
  }

  Widget _buildInfoSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.lightbulb_outline_rounded,
            color: Colors.white.withOpacity(0.9),
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Conseils',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  '• Le code OTP est valable 10 minutes\n'
                  '• Vérifiez votre dossier spam si vous ne recevez pas l\'email\n'
                  '• Le code ne peut être utilisé qu\'une seule fois',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white.withOpacity(0.9),
                        height: 1.5,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _verifyOTP() {
    if (_otpController.text.length == 6) {
      FocusScope.of(context).unfocus();
      context.read<AuthBloc>().add(
            VerifyOtpRequested(
              email: widget.email,
              otp: _otpController.text,
            ),
          );
    }
  }

  void _resendOTP() {
    if (_canResend && !_isLoading) {
      context.read<AuthBloc>().add(
            ResendOtpRequested(widget.email),
          );
    }
  }

  void _redirectBasedOnUserType(User user, BuildContext context) {
    if (user.isAgent) {
      context.go(AppRouter.agentHome);
    } else if (user.isClient) {
      context.go(AppRouter.clientHome);
    }
  }

  void _showSuccessSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: AppColor.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: Theme.of(context).colorScheme.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }
}