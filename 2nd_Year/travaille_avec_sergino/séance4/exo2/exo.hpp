#include <string>
#include <iostream>
#include <vector>

#ifndef NOTIFIER_HPP
#define NOTIFIER_HPP

class INotifier {
public:
    virtual ~INotifier() = default;
    virtual void notify(std::string message) = 0;
};

class EmailNotifier : public INotifier {
public:
    EmailNotifier();
    ~EmailNotifier();
    void notify(std::string message) override;
};

class SMSNotifier : public INotifier {
public:
    SMSNotifier();
    ~SMSNotifier();
    void notify(std::string message) override;
};

class PushNotifier : public INotifier {
public:
    PushNotifier();
    ~PushNotifier();
    void notify(std::string message) override;
};

class NotificationManager {
private:
    std::vector<INotifier*> notifiers;
public:
    NotificationManager();
    ~NotificationManager();
    void addNotifier(INotifier* notifier);
    void removeNotifier(INotifier* notifier);
    void notifyAll(std::string message);
};

#endif

