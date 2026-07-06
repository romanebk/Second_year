#include "exo.hpp"

EmailNotifier::EmailNotifier() {}
EmailNotifier::~EmailNotifier() {}

void EmailNotifier::notify(std::string message)
{
    std::cout << "[EMAIL] Envoi du message : " << message << std::endl;
}

SMSNotifier::SMSNotifier() {}
SMSNotifier::~SMSNotifier() {}

void SMSNotifier::notify(std::string message)
{
    std::cout << "[SMS] Envoi du message : " << message << std::endl;
}

PushNotifier::PushNotifier() {}
PushNotifier::~PushNotifier() {}

void PushNotifier::notify(std::string message)
{
    std::cout << "[PUSH] Envoi du message : " << message << std::endl;
}

NotificationManager::NotificationManager() {}
NotificationManager::~NotificationManager() {}

void NotificationManager::addNotifier(INotifier* notifier)
{
    notifiers.push_back(notifier);
}

void NotificationManager::removeNotifier(INotifier* notifier)
{
    for (auto it = notifiers.begin(); it != notifiers.end(); ++it) {
        if (*it == notifier) {
            notifiers.erase(it);
            break;
        }
    }
}

void NotificationManager::notifyAll(std::string message)
{
    for (INotifier* notifier : notifiers) {
        notifier->notify(message);
    }
}

int main()
{
    // Création des notifiers
    EmailNotifier emailNotifier;
    SMSNotifier smsNotifier;
    PushNotifier pushNotifier;
    
    // Création du manager et ajout des notifiers
    NotificationManager manager;
    manager.addNotifier(&emailNotifier);
    manager.addNotifier(&smsNotifier);
    manager.addNotifier(&pushNotifier);
    
    // Test de notification
    std::cout << "Envoi de la notification à tous les notifiers:" << std::endl;
    manager.notifyAll("Bonjour ! Ceci est un test.");
    
    // Test de suppression d'un notifier
    std::cout << "\nSuppression du SMS notifier et envoi d'une nouvelle notification:" << std::endl;
    manager.removeNotifier(&smsNotifier);
    manager.notifyAll("Message après suppression du SMS.");
    
    return 0;
}
